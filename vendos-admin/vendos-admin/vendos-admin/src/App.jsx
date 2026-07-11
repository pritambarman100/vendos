import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';
import SlotModal from './components/slots/SlotModal';
import './styles/globals.css';

const App = () => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalOpen, setModalOpen]       = useState(false);

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setModalOpen(true);
  };

  const handleAddSlot = () => {
    setSelectedSlot({ id: 'D5', name: '', price: 0, stock: 0, maxCapacity: 20, category: 'Other', status: 'off', enabled: false });
    setModalOpen(true);
  };

  return (
    <BrowserRouter>
      <AppRouter onSlotClick={handleSlotClick} onAddSlot={handleAddSlot} />
      <SlotModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        slot={selectedSlot}
      />
    </BrowserRouter>
  );
};

export default App;
