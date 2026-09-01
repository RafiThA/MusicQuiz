import { createContext } from 'react';

const SelectedAlbumsContext = createContext<[Album[], React.Dispatch<React.SetStateAction<Album[]>>]>([[], () => {}]);

export { SelectedAlbumsContext };