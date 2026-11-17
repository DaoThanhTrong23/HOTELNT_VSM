import { describe, it, expect, vi, afterEach } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MapStep } from '../components/listing-form/MapStep';
import { resolveOptions } from '../components/listing-form/listingFormModel';

const BOUNDS = resolveOptions().mapBounds;
const mapScripts = () => document.head.querySelectorAll('script[data-host-listing-maps]');

const Harness = ({ onChange = () => {}, initial = { latitude: '', longitude: '' } }) => {
  const [values, setValues] = useState(initial);
  return (
    <MapStep
      latitude={values.latitude}
      longitude={values.longitude}
      bounds={BOUNDS}
      onChange={(patch) => {
        onChange(patch);
        setValues((prev) => ({ ...prev, ...patch }));
      }}
    />
  );
};

describe('MapStep', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.google;
    mapScripts().forEach((script) => script.remove());
  });

  it('MAP-01: without an API key it skips the script and keeps manual inputs', () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');
    render(<Harness />);

    expect(mapScripts()).toHaveLength(0);
    expect(screen.getByText('Không tải được bản đồ. Bạn vẫn có thể nhập vĩ độ, kinh độ.')).toBeInTheDocument();
    expect(screen.getByLabelText('Vĩ độ (lat)')).toBeInTheDocument();
    expect(screen.getByLabelText('Kinh độ (lng)')).toBeInTheDocument();
  });

  it('MAP-02: accepts coordinates inside Nha Trang', () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Vĩ độ (lat)'), { target: { value: '12.2388' } });
    fireEvent.change(screen.getByLabelText('Kinh độ (lng)'), { target: { value: '109.1967' } });

    expect(onChange).toHaveBeenCalledWith({ latitude: '12.2388' });
    expect(onChange).toHaveBeenCalledWith({ longitude: '109.1967' });
    expect(screen.getByText('Vị trí hợp lệ — nằm trong khu vực Nha Trang')).toBeInTheDocument();
  });

  it('MAP-03: flags coordinates outside the supported area', () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');
    render(<Harness />);

    fireEvent.change(screen.getByLabelText('Vĩ độ (lat)'), { target: { value: '10.77' } });
    fireEvent.change(screen.getByLabelText('Kinh độ (lng)'), { target: { value: '106.70' } });

    expect(screen.getByText('Vị trí chọn nằm ngoài khu vực hỗ trợ Nha Trang.')).toBeInTheDocument();
    expect(screen.getByLabelText('Vĩ độ (lat)')).toHaveAttribute('aria-invalid', 'true');
  });

  it('MAP-04: injects the script once for two maps and falls back when it fails', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key');
    render(
      <>
        <Harness />
        <Harness />
      </>,
    );

    expect(mapScripts()).toHaveLength(1);
    expect(mapScripts()[0].src).toContain('key=test-key');
    expect(mapScripts()[0].src).toContain('libraries=marker');
    expect(screen.getAllByText('Đang tải bản đồ...')).toHaveLength(2);

    await act(async () => mapScripts()[0].onerror());

    expect(screen.getAllByText('Không tải được bản đồ. Bạn vẫn có thể nhập vĩ độ, kinh độ.')).toHaveLength(2);
  });

  it('MAP-05: dragging the pin updates lat/lng rounded to 6 decimals', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key');
    const markerListeners = {};
    const markers = [];
    class FakeMap {
      addListener() {
        return { remove: vi.fn() };
      }
      panTo() {}
    }
    class FakeMarker {
      constructor(options) {
        Object.assign(this, options);
        markers.push(this);
      }
      addListener(name, handler) {
        markerListeners[name] = handler;
        return { remove: vi.fn() };
      }
    }
    window.google = { maps: { Map: FakeMap, marker: { AdvancedMarkerElement: FakeMarker } } };
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await waitFor(() => expect(markerListeners.dragend).toBeTypeOf('function'));
    expect(markers[0].gmpDraggable).toBe(true);
    expect(markers[0].position).toEqual({ lat: 12.2388, lng: 109.1967 });

    act(() => markerListeners.dragend({ latLng: { lat: () => 12.123456789, lng: () => 109.2000004 } }));

    expect(onChange).toHaveBeenCalledWith({ latitude: '12.123457', longitude: '109.2' });
    expect(screen.getByLabelText('Vĩ độ (lat)')).toHaveValue('12.123457');
    expect(markers[0].position).toEqual({ lat: 12.123457, lng: 109.2 });
  });
});
