/**
 * Custom hook for managing modal state
 */

import { useState, useCallback } from "react";

export type ModalType = "logHours" | "recordService" | "addFuel" | null;

export interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data?: any;
}

export function useModal() {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: null,
    data: undefined,
  });

  const openModal = useCallback((type: ModalType, data?: any) => {
    setModal({
      isOpen: true,
      type,
      data,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal({
      isOpen: false,
      type: null,
      data: undefined,
    });
  }, []);

  const openLogHoursModal = useCallback((equipmentId?: string) => {
    openModal("logHours", { equipmentId });
  }, [openModal]);

  const openRecordServiceModal = useCallback((equipmentId?: string) => {
    openModal("recordService", { equipmentId });
  }, [openModal]);

  const openAddFuelModal = useCallback((equipmentId?: string) => {
    openModal("addFuel", { equipmentId });
  }, [openModal]);

  return {
    modal,
    openModal,
    closeModal,
    openLogHoursModal,
    openRecordServiceModal,
    openAddFuelModal,
  };
}
