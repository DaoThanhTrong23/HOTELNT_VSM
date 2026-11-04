import { ADDRESS_MAX_LENGTH, NAME_MAX_LENGTH, errorId, fieldId } from './listingFormModel';
import { Field, INPUT_CLASS, INPUT_ERROR_CLASS, INPUT_OK_CLASS, ReadOnlyField } from './formFields';

const PROVINCE = 'Khánh Hòa';
const DISTRICT = 'TP. Nha Trang';

const readValue = (values, path) =>
  path.startsWith('lienHe.') ? values.lienHe[path.slice('lienHe.'.length)] : values[path];

const optionName = (list, key, nameKey, value) =>
  list.find((option) => String(option[key]) === String(value))?.[nameKey] ?? '';

export const BasicInfoStep = ({ values, errors, options, detail, readOnly = false, onChange }) => {
  if (readOnly) {
    return (
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-black">Thông tin cơ bản</h2>
        <ReadOnlyField label="Tên cơ sở lưu trú *" value={values.tenCSLT} />
        <ReadOnlyField
          label="Loại hình *"
          value={optionName(options.propertyTypes, 'maLoai', 'tenLoai', values.maLoai) || detail?.tenLoai}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ReadOnlyField label="Tỉnh/Thành phố *" value={PROVINCE} />
          <ReadOnlyField label="Quận/Huyện *" value={DISTRICT} />
          <ReadOnlyField
            label="Phường/Xã *"
            value={optionName(options.wards, 'maPhuong', 'tenPhuong', values.maPhuong) || detail?.tenPhuong}
          />
        </div>
        <ReadOnlyField label="Địa chỉ cụ thể *" value={values.diaChiChiTiet} />
        <ReadOnlyField label="Mô tả" value={values.moTa} />
        <div className="pt-5 border-t border-[#E2E8F0] space-y-4">
          <h3 className="text-lg font-semibold text-black">Kênh liên hệ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReadOnlyField label="Số điện thoại" value={values.lienHe.soDienThoai} />
            <ReadOnlyField label="Zalo" value={values.lienHe.zalo} />
          </div>
          <ReadOnlyField label="Facebook" value={values.lienHe.facebook} />
        </div>
      </div>
    );
  }

  const control = (path) => ({
    id: fieldId(path),
    value: readValue(values, path),
    onChange: (event) => onChange(path, event.target.value),
    'aria-invalid': errors[path] ? 'true' : 'false',
    'aria-describedby': errors[path] ? errorId(path) : undefined,
    className: `${INPUT_CLASS} ${errors[path] ? INPUT_ERROR_CLASS : INPUT_OK_CLASS}`,
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-black">Thông tin cơ bản</h2>
        <p className="text-xs text-[#64748B] mt-0.5">Các trường có dấu * là bắt buộc</p>
      </div>

      <Field path="tenCSLT" label="Tên cơ sở lưu trú" required error={errors.tenCSLT} counter={`${values.tenCSLT.length}/${NAME_MAX_LENGTH}`}>
        <input type="text" maxLength={NAME_MAX_LENGTH} placeholder="Ví dụ: Sea Breeze Homestay" {...control('tenCSLT')} />
      </Field>

      <Field path="maLoai" label="Loại hình" required error={errors.maLoai}>
        <select {...control('maLoai')}>
          <option value="">Chọn loại hình</option>
          {options.propertyTypes.map((type) => (
            <option key={type.maLoai} value={String(type.maLoai)}>
              {type.tenLoai}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field path="province" label="Tỉnh/Thành phố" required>
          <select id={fieldId('province')} disabled value={PROVINCE} className={`${INPUT_CLASS} ${INPUT_OK_CLASS}`}>
            <option value={PROVINCE}>{PROVINCE}</option>
          </select>
        </Field>
        <Field path="district" label="Quận/Huyện" required>
          <select id={fieldId('district')} disabled value={DISTRICT} className={`${INPUT_CLASS} ${INPUT_OK_CLASS}`}>
            <option value={DISTRICT}>{DISTRICT}</option>
          </select>
        </Field>
        <Field path="maPhuong" label="Phường/Xã" required error={errors.maPhuong}>
          <select {...control('maPhuong')}>
            <option value="">Chọn phường/xã</option>
            {options.wards.map((ward) => (
              <option key={ward.maPhuong} value={String(ward.maPhuong)}>
                {ward.tenPhuong}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        path="diaChiChiTiet"
        label="Địa chỉ cụ thể"
        required
        error={errors.diaChiChiTiet}
        hint="Ví dụ: 12 Trần Phú. Phường/Xã chọn ở ô phía trên."
      >
        <input type="text" maxLength={ADDRESS_MAX_LENGTH} placeholder="Số nhà, tên đường" {...control('diaChiChiTiet')} />
      </Field>

      <Field path="moTa" label="Mô tả" error={errors.moTa}>
        <textarea rows={4} placeholder="Giới thiệu ngắn về cơ sở, phòng, không gian..." {...control('moTa')} />
      </Field>

      <div className="pt-5 border-t border-[#E2E8F0] space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-black">Kênh liên hệ</h3>
          <p className="text-xs text-[#64748B] mt-0.5">Khách chỉ thấy nút liên hệ khi bạn đã điền thông tin tương ứng</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field path="lienHe.soDienThoai" label="Số điện thoại" error={errors['lienHe.soDienThoai']}>
            <input type="tel" inputMode="tel" placeholder="0xxx xxx xxx" {...control('lienHe.soDienThoai')} />
          </Field>
          <Field path="lienHe.zalo" label="Zalo" error={errors['lienHe.zalo']}>
            <input type="text" placeholder="Số Zalo hoặc link zalo.me" {...control('lienHe.zalo')} />
          </Field>
        </div>
        <Field path="lienHe.facebook" label="Facebook" error={errors['lienHe.facebook']}>
          <input type="url" placeholder="https://facebook.com/..." {...control('lienHe.facebook')} />
        </Field>
      </div>
    </div>
  );
};
