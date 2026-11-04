import { errorId, fieldId, formatThousands, parseDigits } from './listingFormModel';
import { Field, INPUT_CLASS, INPUT_ERROR_CLASS, INPUT_OK_CLASS, ReadOnlyField } from './formFields';

const AmenityGroup = ({ legend, items, selected, readOnly, onToggle }) => (
  <fieldset className="space-y-3">
    <legend className="text-xs font-medium text-black mb-2">{legend}</legend>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
      {items.map((item) => (
        <label key={item.maTienIch} className="flex items-center gap-2.5 text-sm text-black cursor-pointer min-h-[32px]">
          <input
            type="checkbox"
            checked={selected.includes(item.maTienIch)}
            disabled={readOnly}
            onChange={() => onToggle(item.maTienIch)}
            className="w-4 h-4 rounded accent-black cursor-pointer"
          />
          <span>{item.tenTienIch}</span>
        </label>
      ))}
    </div>
  </fieldset>
);

export const PriceAmenitiesStep = ({ values, errors, options, readOnly = false, onChange }) => {
  const { min, max } = options.priceRange;
  const selected = values.maTienIch;

  const toggleAmenity = (id) =>
    onChange('maTienIch', selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-black">Giá tham khảo</h2>
          <p className="text-xs text-[#64748B] mt-0.5">{`Đơn vị VNĐ, từ ${formatThousands(min)} đến ${formatThousands(max)}`}</p>
        </div>
        {readOnly ? (
          <ReadOnlyField label="Giá tham khảo *" value={values.gia !== '' ? `${formatThousands(values.gia)} ₫` : ''} />
        ) : (
          <Field path="gia" label="Giá tham khảo" required error={errors.gia} className="sm:max-w-xs">
            <div className="relative">
              <input
                id={fieldId('gia')}
                type="text"
                inputMode="numeric"
                placeholder="Ví dụ: 650.000"
                value={formatThousands(values.gia)}
                onChange={(event) => onChange('gia', parseDigits(event.target.value))}
                aria-invalid={errors.gia ? 'true' : 'false'}
                aria-describedby={errors.gia ? errorId('gia') : undefined}
                className={`${INPUT_CLASS} pr-9 ${errors.gia ? INPUT_ERROR_CLASS : INPUT_OK_CLASS}`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#64748B]" aria-hidden="true">
                ₫
              </span>
            </div>
          </Field>
        )}
      </section>

      <section className="space-y-4 pt-6 border-t border-[#E2E8F0]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-black">Tiện ích</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Chọn ít nhất 1 tiện ích</p>
          </div>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
              selected.length > 0 ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#F1F5F9] text-[#64748B]'
            }`}
          >
            {`${selected.length} đã chọn`}
          </span>
        </div>
        {options.amenities.length > 0 ? (
          <AmenityGroup legend="Tiện ích" items={options.amenities} selected={selected} readOnly={readOnly} onToggle={toggleAmenity} />
        ) : (
          <p className="text-sm text-[#64748B]">Chưa có danh mục tiện ích.</p>
        )}
        {options.nearbyPlaces.length > 0 && (
          <AmenityGroup
            legend="Tiện ích lân cận"
            items={options.nearbyPlaces}
            selected={selected}
            readOnly={readOnly}
            onToggle={toggleAmenity}
          />
        )}
        {errors.maTienIch && (
          <p id={errorId('maTienIch')} className="text-xs text-[#DC2626]">
            {errors.maTienIch}
          </p>
        )}
      </section>
    </div>
  );
};
