import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Play, X } from 'lucide-react';
import { MEDIA_LIMITS } from '../../../../constants/enums';
import { deleteListingMedia, isCanceled, uploadListingMedia } from '../../api/hostApi';

const MB = 1024 * 1024;
const RULES = {
  IMAGE: {
    mimes: MEDIA_LIMITS.ALLOWED_IMAGE_TYPES,
    extensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSizeMb: MEDIA_LIMITS.IMAGE_MAX_SIZE_MB,
    maxCount: MEDIA_LIMITS.IMAGE_MAX,
    formatLabel: 'JPG, PNG, WEBP',
    unit: 'ảnh',
  },
  VIDEO: {
    mimes: MEDIA_LIMITS.ALLOWED_VIDEO_TYPES,
    extensions: ['mp4'],
    maxSizeMb: MEDIA_LIMITS.VIDEO_MAX_SIZE_MB,
    maxCount: MEDIA_LIMITS.VIDEO_MAX,
    formatLabel: 'MP4',
    unit: 'video',
  },
};
// Errors that make further uploads pointless: stop the queue and let the editor show a banner.
const BLOCKING_CODES = ['LISTING_LOCKED_PENDING', 'LISTING_REMOVED', 'NOT_OWNER', 'LISTING_NOT_FOUND', 'ACCOUNT_LOCKED'];
const ACTIVE_STATUSES = ['queued', 'uploading'];

const extensionOf = (name) => (name.includes('.') ? name.split('.').pop().toLowerCase() : '');

const formatMegabytes = (bytes) => {
  const megabytes = (bytes || 0) / MB;
  return `${megabytes >= 10 ? Math.round(megabytes) : Number(megabytes.toFixed(1))}MB`;
};

const fileNameFromUrl = (url) => {
  const last = String(url || '').split('?')[0].split('/').pop();
  return last ? decodeURIComponent(last) : 'video.mp4';
};

// Client checks only warn early; the server still validates the real file type.
const validateFile = (file, type, slotsLeft) => {
  const rule = RULES[type];
  const extension = extensionOf(file.name);
  if (!rule.extensions.includes(extension) || (file.type && !rule.mimes.includes(file.type))) {
    return `Sai định dạng (chỉ ${rule.formatLabel})`;
  }
  if (file.size > rule.maxSizeMb * MB) return `Vượt quá ${rule.maxSizeMb}MB`;
  if (slotsLeft <= 0) return `Vượt quá giới hạn ${rule.maxCount} ${rule.unit}`;
  return null;
};

const createPreview = (file) =>
  typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : null;

const revokePreview = (url) => {
  if (url && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
};

export const MediaStep = ({
  maCSLT,
  media,
  counts,
  readOnly = false,
  onUploaded,
  onDeleted,
  onReorder,
  onBlockingError,
  onQueueIdle,
  onBeforeMediaChange,
  onNotify,
}) => {
  const [entries, setEntries] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const queueRef = useRef([]);
  const activeRef = useRef(null);
  const controllersRef = useRef(new Map());
  const previewsRef = useRef(new Map());
  const mountedRef = useRef(true);
  const localIdRef = useRef(0);
  const latestRef = useRef({});

  // The upload loop is async; it reads the newest props through this ref.
  useEffect(() => {
    latestRef.current = { maCSLT, counts, onUploaded, onBlockingError, onQueueIdle };
  });

  useEffect(() => {
    mountedRef.current = true;
    const controllers = controllersRef.current;
    const previews = previewsRef.current;
    return () => {
      mountedRef.current = false;
      queueRef.current = [];
      controllers.forEach((controller) => controller.abort());
      previews.forEach((url) => revokePreview(url));
      previews.clear();
    };
  }, []);

  const updateEntry = (localId, patch) =>
    setEntries((prev) => prev.map((entry) => (entry.localId === localId ? { ...entry, ...patch } : entry)));

  const removeEntry = (localId) => {
    revokePreview(previewsRef.current.get(localId));
    previewsRef.current.delete(localId);
    setEntries((prev) => prev.filter((entry) => entry.localId !== localId));
  };

  // One file per request, strictly in order (upload order decides thuTu on the server).
  const runQueue = async () => {
    if (activeRef.current) return;
    let uploadedCount = 0;
    while (queueRef.current.length > 0 && mountedRef.current) {
      const entry = queueRef.current.shift();
      const controller = new AbortController();
      activeRef.current = entry;
      controllersRef.current.set(entry.localId, controller);
      updateEntry(entry.localId, { status: 'uploading', progress: 0 });
      try {
        const uploaded = await uploadListingMedia(
          latestRef.current.maCSLT,
          { file: entry.file, type: entry.type },
          {
            signal: controller.signal,
            onProgress: (progress) => {
              if (mountedRef.current) updateEntry(entry.localId, { progress });
            },
          },
        );
        if (!mountedRef.current) break;
        removeEntry(entry.localId);
        uploadedCount += 1;
        latestRef.current.onUploaded?.(uploaded);
      } catch (err) {
        if (!mountedRef.current) break;
        if (controller.signal.aborted || isCanceled(err)) {
          removeEntry(entry.localId);
        } else if (BLOCKING_CODES.includes(err.code)) {
          updateEntry(entry.localId, { status: 'error', error: err.message });
          queueRef.current.splice(0).forEach((waiting) =>
            updateEntry(waiting.localId, { status: 'error', error: 'Đã dừng tải lên.' }),
          );
          latestRef.current.onBlockingError?.(err);
        } else {
          updateEntry(entry.localId, { status: 'error', error: err.message });
        }
      } finally {
        controllersRef.current.delete(entry.localId);
        activeRef.current = null;
      }
    }
    if (mountedRef.current && uploadedCount > 0) latestRef.current.onQueueIdle?.();
  };

  const addFiles = async (files, type) => {
    if (readOnly || files.length === 0) return;
    const allowed = onBeforeMediaChange ? await onBeforeMediaChange() : true;
    if (!allowed || !mountedRef.current) return;

    const rule = RULES[type];
    const used = type === 'IMAGE' ? latestRef.current.counts?.soAnh ?? 0 : latestRef.current.counts?.soVideo ?? 0;
    const waiting = queueRef.current.filter((entry) => entry.type === type).length;
    const active = activeRef.current?.type === type ? 1 : 0;
    let slotsLeft = rule.maxCount - used - waiting - active;

    const created = files.map((file) => {
      const error = validateFile(file, type, slotsLeft);
      if (!error) slotsLeft -= 1;
      localIdRef.current += 1;
      const localId = `local-${localIdRef.current}`;
      const previewUrl = !error && type === 'IMAGE' ? createPreview(file) : null;
      if (previewUrl) previewsRef.current.set(localId, previewUrl);
      return { localId, file, name: file.name, size: file.size, type, status: error ? 'invalid' : 'queued', progress: 0, error, previewUrl };
    });

    setEntries((prev) => [...prev, ...created]);
    queueRef.current.push(...created.filter((entry) => entry.status === 'queued'));
    runQueue();
  };

  const cancelEntry = (entry) => {
    const controller = controllersRef.current.get(entry.localId);
    if (controller) {
      controller.abort();
      return;
    }
    queueRef.current = queueRef.current.filter((waiting) => waiting.localId !== entry.localId);
    removeEntry(entry.localId);
  };

  const deleteServerMedia = async (item) => {
    if (readOnly || deletingIds.includes(item.mediaId)) return;
    const allowed = onBeforeMediaChange ? await onBeforeMediaChange() : true;
    if (!allowed) return;
    setDeletingIds((prev) => [...prev, item.mediaId]);
    try {
      const response = await deleteListingMedia(maCSLT, item.mediaId);
      onDeleted?.(item.mediaId, response);
    } catch (err) {
      if (err.code === 'MIN_IMAGES_REQUIRED') {
        onNotify?.({ type: 'error', message: 'Cơ sở cần có tối thiểu 3 ảnh.' });
      } else if (err.code === 'MEDIA_NOT_FOUND') {
        onDeleted?.(item.mediaId, null);
        onNotify?.({ type: 'error', message: err.message });
      } else if (BLOCKING_CODES.includes(err.code)) {
        onBlockingError?.(err);
      } else {
        onNotify?.({ type: 'error', message: err.message });
      }
    } finally {
      if (mountedRef.current) setDeletingIds((prev) => prev.filter((id) => id !== item.mediaId));
    }
  };

  const images = media.filter((item) => item.type === 'IMAGE');
  const videos = media.filter((item) => item.type === 'VIDEO');
  const localImages = entries.filter((entry) => entry.type === 'IMAGE');
  const localVideos = entries.filter((entry) => entry.type === 'VIDEO');

  // D3: reordering is local only; the API has no endpoint to persist thuTu.
  const moveImage = (from, to) => {
    if (from === to || from === null) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder?.([...next, ...videos]);
  };

  const imageLimitReached = (counts?.soAnh ?? 0) >= MEDIA_LIMITS.IMAGE_MAX;
  const videoLimitReached = (counts?.soVideo ?? 0) >= MEDIA_LIMITS.VIDEO_MAX;
  const isActive = (entry) => ACTIVE_STATUSES.includes(entry.status);

  return (
    <div className="space-y-6">
      <section aria-labelledby="media-images-title" className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="media-images-title" className="text-lg font-semibold text-black">Hình ảnh</h2>
            <p className="text-xs text-[#64748B] mt-0.5">JPG, PNG, WEBP · tối đa 10MB/ảnh · tối thiểu 3, tối đa 100 ảnh</p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] shrink-0">
            {`${counts?.soAnh ?? 0}/${MEDIA_LIMITS.IMAGE_MAX} ảnh`}
          </span>
        </div>

        {!readOnly && (
          <div
            data-testid="image-dropzone"
            aria-disabled={imageLimitReached ? 'true' : 'false'}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (!imageLimitReached) addFiles(Array.from(event.dataTransfer?.files ?? []), 'IMAGE');
            }}
            className={`border-2 border-dashed rounded-xl px-4 py-8 text-center ${
              imageLimitReached ? 'border-[#CBD5E1] bg-[#F1F5F9] opacity-60' : 'border-[#CBD5E1] bg-[#F8FAFC]'
            }`}
          >
            <div className="w-10 h-10 mx-auto rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-black">
              <ArrowUp size={18} />
            </div>
            <p className="mt-3 text-sm font-semibold text-black">Kéo thả ảnh vào đây</p>
            <p className="text-xs text-[#64748B] my-1.5">hoặc</p>
            <button
              type="button"
              disabled={imageLimitReached}
              onClick={() => imageInputRef.current?.click()}
              className="px-4 py-2 min-h-[44px] rounded-lg border border-[#CBD5E1] bg-white text-sm text-black hover:bg-[#F8F4E8] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Chọn tệp từ máy
            </button>
            <input
              ref={imageInputRef}
              type="file"
              multiple
              hidden
              tabIndex={-1}
              disabled={imageLimitReached}
              aria-label="Chọn ảnh từ máy"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = '';
                addFiles(files, 'IMAGE');
              }}
            />
          </div>
        )}

        {images.length + localImages.length > 0 ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" aria-label="Danh sách ảnh">
            {images.map((item, index) => (
              <li
                key={item.mediaId}
                data-testid="server-image"
                draggable={!readOnly}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => {
                  if (!readOnly) event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  moveImage(dragIndex, index);
                  setDragIndex(null);
                }}
                className={`group relative aspect-4/3 rounded-lg overflow-hidden bg-[#CBD5E1] ${readOnly ? '' : 'cursor-grab'}`}
              >
                <img src={item.url} alt={`Ảnh ${index + 1}`} loading="lazy" className="w-full h-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-1.5 bottom-1.5 px-2 py-0.5 rounded-full bg-white text-[11px] font-medium text-black">
                    Ảnh bìa
                  </span>
                )}
                {!readOnly && (
                  <>
                    <button
                      type="button"
                      aria-label={`Xóa ảnh ${index + 1}`}
                      disabled={deletingIds.includes(item.mediaId)}
                      onClick={() => deleteServerMedia(item)}
                      className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-sm cursor-pointer disabled:opacity-40"
                    >
                      <X size={14} />
                    </button>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(index, 0)}
                        aria-label={`Đặt ảnh ${index + 1} làm ảnh bìa`}
                        className="absolute left-1.5 bottom-1.5 px-2 py-0.5 rounded-full bg-black/70 text-[11px] text-white hover:bg-black cursor-pointer md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity"
                      >
                        Đặt làm ảnh bìa
                      </button>
                    )}
                  </>
                )}
              </li>
            ))}
            {localImages.map((entry) => {
              const failed = entry.status === 'invalid' || entry.status === 'error';
              return (
                <li
                  key={entry.localId}
                  data-testid="local-image"
                  className={`relative aspect-4/3 rounded-lg overflow-hidden ${
                    failed ? 'border border-[#DC2626] bg-[#FEF2F2]' : 'bg-[#F1F5F9]'
                  }`}
                >
                  {entry.previewUrl && !failed && (
                    <img src={entry.previewUrl} alt="" className="w-full h-full object-cover opacity-60" />
                  )}
                  <div className="absolute inset-0 p-2 flex flex-col justify-end text-xs">
                    <p className="font-medium text-black truncate">{entry.name}</p>
                    {failed && <p className="text-[#DC2626]">{entry.error}</p>}
                    {entry.status === 'uploading' && <p className="text-black">{`Đang tải ${entry.progress}%`}</p>}
                    {entry.status === 'queued' && <p className="text-[#64748B]">Đang chờ</p>}
                  </div>
                  <button
                    type="button"
                    aria-label={isActive(entry) ? `Hủy tải ${entry.name}` : `Gỡ ${entry.name}`}
                    onClick={() => cancelEntry(entry)}
                    className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-sm cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          readOnly && <p className="text-sm text-[#64748B]">Chưa có ảnh</p>
        )}

        <p className="text-xs text-[#64748B]">
          {readOnly ? 'Ảnh đầu tiên được dùng làm ảnh bìa.' : 'Ảnh đầu tiên được dùng làm ảnh bìa. Kéo để đổi thứ tự.'}
        </p>
      </section>

      <section aria-labelledby="media-videos-title" className="space-y-4 pt-6 border-t border-[#CBD5E1]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="media-videos-title" className="text-lg font-semibold text-black">Video</h2>
            <p className="text-xs text-[#64748B] mt-0.5">MP4 · tối đa 100MB/video · tối đa 5 video</p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] shrink-0">
            {`${counts?.soVideo ?? 0}/${MEDIA_LIMITS.VIDEO_MAX} video`}
          </span>
        </div>

        {videos.length + localVideos.length > 0 ? (
          <ul className="space-y-2" aria-label="Danh sách video">
            {videos.map((item) => (
              <li key={item.mediaId} data-testid="server-video" className="flex items-center gap-3 p-3 rounded-lg border border-[#CBD5E1]">
                <span className="w-9 h-9 rounded-lg border border-[#CBD5E1] flex items-center justify-center shrink-0">
                  <Play size={14} />
                </span>
                <a href={item.url} target="_blank" rel="noreferrer" className="flex-1 min-w-0 text-sm text-black truncate hover:underline">
                  {`${fileNameFromUrl(item.url)} · ${formatMegabytes(item.kichThuoc)}`}
                </a>
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={`Xóa video ${fileNameFromUrl(item.url)}`}
                    disabled={deletingIds.includes(item.mediaId)}
                    onClick={() => deleteServerMedia(item)}
                    className="px-3 py-1.5 min-h-[36px] rounded-lg border border-[#CBD5E1] text-xs hover:bg-[#F8F4E8] cursor-pointer disabled:opacity-40"
                  >
                    Xóa
                  </button>
                )}
              </li>
            ))}
            {localVideos.map((entry) => {
              const failed = entry.status === 'invalid' || entry.status === 'error';
              return (
                <li
                  key={entry.localId}
                  data-testid="local-video"
                  className={`flex items-center gap-3 p-3 rounded-lg border ${failed ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#CBD5E1]'}`}
                >
                  <span className="w-9 h-9 rounded-lg border border-[#CBD5E1] flex items-center justify-center shrink-0">
                    <Play size={14} />
                  </span>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-black truncate">{`${entry.name} · ${formatMegabytes(entry.size)}`}</span>
                      {entry.status === 'uploading' && <span className="text-xs text-[#64748B] shrink-0">{`Đang tải ${entry.progress}%`}</span>}
                      {entry.status === 'queued' && <span className="text-xs text-[#64748B] shrink-0">Đang chờ</span>}
                    </div>
                    {entry.status === 'uploading' && (
                      <div className="h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden" role="progressbar" aria-valuenow={entry.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ tải ${entry.name}`}>
                        <div className="h-full bg-black transition-all" style={{ width: `${entry.progress}%` }} />
                      </div>
                    )}
                    {failed && <p className="text-xs text-[#DC2626]">{entry.error}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => cancelEntry(entry)}
                    aria-label={isActive(entry) ? `Hủy tải ${entry.name}` : `Gỡ ${entry.name}`}
                    className="px-3 py-1.5 min-h-[36px] rounded-lg border border-[#CBD5E1] text-xs hover:bg-[#F8F4E8] cursor-pointer"
                  >
                    {isActive(entry) ? 'Hủy' : 'Gỡ'}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          readOnly && <p className="text-sm text-[#64748B]">Chưa có video</p>
        )}

        {!readOnly && (
          <>
            <button
              type="button"
              disabled={videoLimitReached}
              onClick={() => videoInputRef.current?.click()}
              className="px-4 py-2 min-h-[44px] rounded-lg border border-[#CBD5E1] bg-white text-sm text-black hover:bg-[#F8F4E8] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Tải video lên
            </button>
            <input
              ref={videoInputRef}
              type="file"
              multiple
              hidden
              tabIndex={-1}
              disabled={videoLimitReached}
              aria-label="Chọn video từ máy"
              accept=".mp4,video/mp4"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = '';
                addFiles(files, 'VIDEO');
              }}
            />
          </>
        )}
      </section>
    </div>
  );
};
