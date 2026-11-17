import { useSearchParams } from 'react-router-dom';
import { toPositiveInt } from './api/hostApi';
import { ListingAccessState } from './components/listing-form/ListingAccessState';
import { ListingEditor } from './components/listing-form/ListingEditor';

// Figma 12.1 – 12.6. After the first save the draft id lives in the URL (?id=&step=),
// so reloading the page continues the same draft instead of creating a duplicate.
export const AddHotelPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawId = searchParams.get('id');
  const maCSLT = toPositiveInt(rawId);
  const initialStep = toPositiveInt(searchParams.get('step')) ?? 1;

  if (rawId !== null && maCSLT === null) return <ListingAccessState variant="not-found" />;

  return (
    <ListingEditor
      mode="create"
      maCSLT={maCSLT}
      initialStep={initialStep}
      onCreated={(id) => setSearchParams({ id: String(id), step: '2' }, { replace: true })}
      onStepChange={(step) =>
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            if (next.get('id')) next.set('step', String(step));
            return next;
          },
          { replace: true },
        )
      }
    />
  );
};
