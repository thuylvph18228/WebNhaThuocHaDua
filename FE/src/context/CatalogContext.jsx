import { createContext, useContext, useState } from 'react';
import {
  initialReasons, initialSuppliers, initialWarehouses, initialExportReasons,
} from '../data/mockInventory';

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [reasons,       setReasons]       = useState(initialReasons);
  const [suppliers,     setSuppliers]     = useState(initialSuppliers);
  const [warehouses,    setWarehouses]    = useState(initialWarehouses);
  const [exportReasons, setExportReasons] = useState(initialExportReasons);

  return (
    <CatalogContext.Provider value={{
      reasons,       setReasons,
      suppliers,     setSuppliers,
      warehouses,    setWarehouses,
      exportReasons, setExportReasons,
    }}>
      {children}
    </CatalogContext.Provider>
  );
}

export const useCatalog = () => useContext(CatalogContext);
