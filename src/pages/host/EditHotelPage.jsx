import { useParams } from 'react-router-dom';
import { toPositiveInt } from './api/hostApi';
import { ListingAccessState } from './components/listing-form/ListingAccessState';
import { ListingEditor } from './components/listing-form/ListingEditor';

// Figma 13.1 – 13.5: behaviour depends on the listing status returned by the API.
export const EditHotelPage = () => {
  const { id } = useParams();
  const maCSLT = toPositiveInt(id);

  if (maCSLT === null) return <ListingAccessState variant="not-found" />;

  return <ListingEditor key={maCSLT} mode="edit" maCSLT={maCSLT} />;
};
