import { useParams, useSearchParams } from 'react-router-dom';
import { toPositiveInt } from './api/hostApi';
import { ListingAccessState } from './components/listing-form/ListingAccessState';
import { ListingEditor } from './components/listing-form/ListingEditor';

// Figma 13.1 – 13.5: behaviour depends on the listing status returned by the API.
export const EditHotelPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const maCSLT = toPositiveInt(id);

  if (id === '403' || searchParams.get('mock') === 'forbidden') {
    return <ListingAccessState variant="forbidden" />;
  }

  if (maCSLT === null || id === '404' || searchParams.get('mock') === 'not-found') {
    return <ListingAccessState variant="not-found" />;
  }

  return <ListingEditor key={maCSLT} mode="edit" maCSLT={maCSLT} />;
};
