import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { MediaStep } from '../components/listing-form/MediaStep';
import { ApiError, deleteListingMedia, uploadListingMedia } from '../api/hostApi';

vi.mock('../api/hostApi', async (importOriginal) => ({
  ...(await importOriginal()),
  uploadListingMedia: vi.fn(),
  deleteListingMedia: vi.fn(),
}));

const MB = 1024 * 1024;

const makeFile = (name, type, sizeBytes = 1024) => {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
};

const image = (mediaId, thuTu) => ({ mediaId, url: `https://cdn.test/${mediaId}.jpg`, type: 'IMAGE', kichThuoc: MB, thuTu });

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

// Plays the editor's role: owns the server media list and counts.
const Harness = ({ initialMedia = [], initialCounts = { soAnh: 0, soVideo: 0 }, ...props }) => {
  const [media, setMedia] = useState(initialMedia);
  const [counts, setCounts] = useState(initialCounts);
  return (
    <MediaStep
      maCSLT={12}
      media={media}
      counts={counts}
      onUploaded={(uploaded) => {
        setMedia((prev) => [...prev, uploaded]);
        setCounts({ soAnh: uploaded.soAnh, soVideo: uploaded.soVideo });
        props.onUploaded?.(uploaded);
      }}
      onDeleted={(mediaId, response) => {
        setMedia((prev) => prev.filter((item) => item.mediaId !== mediaId));
        if (response) setCounts({ soAnh: response.soAnh, soVideo: response.soVideo });
      }}
      onReorder={setMedia}
      {...props}
    />
  );
};

const chooseImages = (files) => fireEvent.change(screen.getByLabelText('Chọn ảnh từ máy'), { target: { files } });
const chooseVideos = (files) => fireEvent.change(screen.getByLabelText('Chọn video từ máy'), { target: { files } });

describe('MediaStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('MED-01: rejects oversized and unsupported files on the client', async () => {
    render(<Harness />);
    chooseImages([makeFile('phong-5.png', 'image/png', 11 * MB), makeFile('anim.gif', 'image/gif')]);

    expect(await screen.findByText('Vượt quá 10MB')).toBeInTheDocument();
    expect(screen.getByText('Sai định dạng (chỉ JPG, PNG, WEBP)')).toBeInTheDocument();
    expect(uploadListingMedia).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Gỡ anim.gif' }));
    expect(screen.queryByText('anim.gif')).not.toBeInTheDocument();
  });

  it('MED-02: uploads valid images one at a time and shows progress', async () => {
    const calls = [deferred(), deferred(), deferred()];
    uploadListingMedia.mockImplementation(() => calls[uploadListingMedia.mock.calls.length - 1].promise);
    render(<Harness />);

    chooseImages([makeFile('a.jpg', 'image/jpeg'), makeFile('b.png', 'image/png'), makeFile('c.webp', 'image/webp')]);

    await waitFor(() => expect(uploadListingMedia).toHaveBeenCalledTimes(1));
    expect(uploadListingMedia.mock.calls[0][0]).toBe(12);
    expect(uploadListingMedia.mock.calls[0][1]).toMatchObject({ type: 'IMAGE' });
    expect(uploadListingMedia.mock.calls[0][1].file.name).toBe('a.jpg');

    act(() => uploadListingMedia.mock.calls[0][2].onProgress(50));
    expect(screen.getByText('Đang tải 50%')).toBeInTheDocument();

    for (let index = 0; index < 3; index += 1) {
      expect(uploadListingMedia).toHaveBeenCalledTimes(index + 1);
      await act(async () => calls[index].resolve({ ...image(100 + index, index + 1), soAnh: index + 1, soVideo: 0 }));
    }

    await waitFor(() => expect(screen.getAllByTestId('server-image')).toHaveLength(3));
    expect(screen.getByText('3/100 ảnh')).toBeInTheDocument();
    expect(uploadListingMedia.mock.calls.map(([, payload]) => payload.file.name)).toEqual(['a.jpg', 'b.png', 'c.webp']);
  });

  it('MED-03: cancelling an upload aborts it and continues with the next file', async () => {
    const second = deferred();
    uploadListingMedia
      .mockImplementationOnce(
        (_id, _payload, { signal }) =>
          new Promise((_, reject) => signal.addEventListener('abort', () => reject(new ApiError({ code: 'CANCELED' })))),
      )
      .mockImplementationOnce(() => second.promise);
    render(<Harness />);

    chooseImages([makeFile('a.jpg', 'image/jpeg'), makeFile('b.jpg', 'image/jpeg')]);
    await waitFor(() => expect(uploadListingMedia).toHaveBeenCalledTimes(1));
    const firstSignal = uploadListingMedia.mock.calls[0][2].signal;

    fireEvent.click(screen.getByRole('button', { name: 'Hủy tải a.jpg' }));

    await waitFor(() => expect(uploadListingMedia).toHaveBeenCalledTimes(2));
    expect(firstSignal.aborted).toBe(true);
    expect(screen.queryByText('a.jpg')).not.toBeInTheDocument();
    expect(uploadListingMedia.mock.calls[1][1].file.name).toBe('b.jpg');
  });

  it('MED-04: shows a server FILE_TOO_LARGE error on the item', async () => {
    uploadListingMedia.mockRejectedValue(
      new ApiError({ status: 413, code: 'FILE_TOO_LARGE', message: 'Tệp quá lớn: ảnh tối đa 10MB, video tối đa 100MB (ảnh Open Graph tối đa 5MB).' }),
    );
    render(<Harness />);
    chooseImages([makeFile('a.jpg', 'image/jpeg')]);

    expect(
      await screen.findByText('Tệp quá lớn: ảnh tối đa 10MB, video tối đa 100MB (ảnh Open Graph tối đa 5MB).'),
    ).toBeInTheDocument();
  });

  it('MED-05: stops the queue on LISTING_LOCKED_PENDING and reports it', async () => {
    const onBlockingError = vi.fn();
    uploadListingMedia.mockRejectedValue(
      new ApiError({ status: 409, code: 'LISTING_LOCKED_PENDING', message: 'Cơ sở đang chờ duyệt nên không thể chỉnh sửa. Hãy rút lại yêu cầu duyệt trước.' }),
    );
    render(<Harness onBlockingError={onBlockingError} />);
    chooseImages([makeFile('a.jpg', 'image/jpeg'), makeFile('b.jpg', 'image/jpeg')]);

    await waitFor(() => expect(onBlockingError).toHaveBeenCalledWith(expect.objectContaining({ code: 'LISTING_LOCKED_PENDING' })));
    expect(uploadListingMedia).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Đã dừng tải lên.')).toBeInTheDocument();
  });

  it('MED-06: deletes a server image and updates the counter', async () => {
    deleteListingMedia.mockResolvedValue({ message: 'Xóa file thành công', soAnh: 3, soVideo: 0, thayDoiTrangThai: false });
    render(<Harness initialMedia={[image(7, 1), image(8, 2), image(9, 3), image(10, 4)]} initialCounts={{ soAnh: 4, soVideo: 0 }} />);

    fireEvent.click(screen.getByRole('button', { name: 'Xóa ảnh 1' }));

    await waitFor(() => expect(deleteListingMedia).toHaveBeenCalledWith(12, 7));
    await waitFor(() => expect(screen.getAllByTestId('server-image')).toHaveLength(3));
    expect(screen.getByText('3/100 ảnh')).toBeInTheDocument();
  });

  it('MED-07: shows MIN_IMAGES_REQUIRED as a toast', async () => {
    const onNotify = vi.fn();
    deleteListingMedia.mockRejectedValue(new ApiError({ status: 409, code: 'MIN_IMAGES_REQUIRED', message: 'Cơ sở cần có tối thiểu 3 ảnh.' }));
    render(<Harness initialMedia={[image(7, 1), image(8, 2), image(9, 3)]} initialCounts={{ soAnh: 3, soVideo: 0 }} onNotify={onNotify} />);

    fireEvent.click(screen.getByRole('button', { name: 'Xóa ảnh 2' }));

    await waitFor(() => expect(onNotify).toHaveBeenCalledWith({ type: 'error', message: 'Cơ sở cần có tối thiểu 3 ảnh.' }));
    expect(screen.getAllByTestId('server-image')).toHaveLength(3);
  });

  it('MED-08: disables image upload once 100 images exist', () => {
    render(<Harness initialCounts={{ soAnh: 100, soVideo: 0 }} />);

    expect(screen.getByRole('button', { name: 'Chọn tệp từ máy' })).toBeDisabled();
    expect(screen.getByTestId('image-dropzone')).toHaveAttribute('aria-disabled', 'true');
  });

  it('MED-09: "Đặt làm ảnh bìa" reorders locally without calling the API', () => {
    render(<Harness initialMedia={[image(7, 1), image(8, 2), image(9, 3)]} initialCounts={{ soAnh: 3, soVideo: 0 }} />);

    fireEvent.click(screen.getByRole('button', { name: 'Đặt ảnh 3 làm ảnh bìa' }));

    const tiles = screen.getAllByTestId('server-image');
    expect(within(tiles[0]).getByRole('img')).toHaveAttribute('src', 'https://cdn.test/9.jpg');
    expect(within(tiles[0]).getByText('Ảnh bìa')).toBeInTheDocument();
    expect(uploadListingMedia).not.toHaveBeenCalled();
    expect(deleteListingMedia).not.toHaveBeenCalled();
  });

  it('MED-10: does nothing when onBeforeMediaChange declines', async () => {
    const onBeforeMediaChange = vi.fn().mockResolvedValue(false);
    render(
      <Harness
        initialMedia={[image(7, 1), image(8, 2), image(9, 3), image(10, 4)]}
        initialCounts={{ soAnh: 4, soVideo: 0 }}
        onBeforeMediaChange={onBeforeMediaChange}
      />,
    );

    chooseImages([makeFile('a.jpg', 'image/jpeg')]);
    fireEvent.click(screen.getByRole('button', { name: 'Xóa ảnh 1' }));

    await waitFor(() => expect(onBeforeMediaChange).toHaveBeenCalledTimes(2));
    expect(uploadListingMedia).not.toHaveBeenCalled();
    expect(deleteListingMedia).not.toHaveBeenCalled();
    expect(screen.queryByText('a.jpg')).not.toBeInTheDocument();
  });

  it('MED-11: read-only mode hides upload, delete and reorder controls', () => {
    render(<Harness readOnly initialMedia={[image(7, 1), image(8, 2)]} initialCounts={{ soAnh: 2, soVideo: 0 }} />);

    expect(screen.queryByTestId('image-dropzone')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Xóa ảnh/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ảnh bìa/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '+ Tải video lên' })).not.toBeInTheDocument();
    screen.getAllByTestId('server-image').forEach((tile) => expect(tile).toHaveAttribute('draggable', 'false'));
  });

  it('MED-12: uploads an mp4 as VIDEO and shows its size', async () => {
    uploadListingMedia.mockReturnValue(new Promise(() => {}));
    render(<Harness />);

    chooseVideos([makeFile('gioi-thieu-homestay.mp4', 'video/mp4', 48 * MB)]);

    await waitFor(() => expect(uploadListingMedia).toHaveBeenCalledTimes(1));
    expect(uploadListingMedia.mock.calls[0][1]).toMatchObject({ type: 'VIDEO' });
    expect(screen.getByText('gioi-thieu-homestay.mp4 · 48MB')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hủy tải gioi-thieu-homestay.mp4' })).toHaveTextContent('Hủy');
  });
});
