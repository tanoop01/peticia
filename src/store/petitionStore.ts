import { create } from 'zustand';
import { Petition } from '@/types';

interface PetitionState {
  petitions: Petition[];
  selectedPetition: Petition | null;
  isLoading: boolean;
  setPetitions: (petitions: Petition[]) => void;
  addPetition: (petition: Petition) => void;
  updatePetition: (id: string, updates: Partial<Petition>) => void;
  selectPetition: (petition: Petition | null) => void;
  setLoading: (loading: boolean) => void;
}

export const usePetitionStore = create<PetitionState>((set) => ({
  petitions: [],
  selectedPetition: null,
  isLoading: false,
  setPetitions: (petitions) => set({ petitions }),
  addPetition: (petition) => set((state) => ({ petitions: [petition, ...state.petitions] })),
  updatePetition: (id, updates) => set((state) => ({
    petitions: state.petitions.map((p) => p.id === id ? { ...p, ...updates } : p),
    selectedPetition: state.selectedPetition?.id === id 
      ? { ...state.selectedPetition, ...updates } 
      : state.selectedPetition
  })),
  selectPetition: (petition) => set({ selectedPetition: petition }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
