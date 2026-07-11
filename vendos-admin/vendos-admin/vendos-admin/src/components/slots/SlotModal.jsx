import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import Modal   from '../ui/Modal';
import Button  from '../ui/Button';
import Toggle  from '../ui/Toggle';
import { useSlotStore } from '../../store/slotStore';
import { CATEGORIES, OFFER_TYPES } from '../../constants/machineConfig';
import styles from './SlotModal.module.css';

const EMPTY_FORM = {
  name: '', price: '', stock: '', category: 'Drinks',
  offer: null, offerType: OFFER_TYPES[0], offerValue: '', enabled: true,
};

const SlotModal = ({ isOpen, onClose, slot }) => {
  const updateSlot = useSlotStore(s => s.updateSlot);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [offerOn, setOfferOn]   = useState(false);

  useEffect(() => {
    if (slot) {
      setForm({
        name:       slot.name     || '',
        price:      slot.price    || '',
        stock:      slot.stock    || '',
        category:   slot.category || 'Drinks',
        offerType:  OFFER_TYPES[0],
        offerValue: '',
        enabled:    slot.enabled ?? true,
      });
      setOfferOn(!!slot.offer);
    }
  }, [slot]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!slot) return;
    updateSlot(slot.id, {
      name:     form.name,
      price:    Number(form.price),
      stock:    Number(form.stock),
      category: form.category,
      enabled:  form.enabled,
      offer:    offerOn ? { type: form.offerType, value: form.offerValue } : null,
    });
    onClose();
  };

  const offerPreview = () => {
    if (!offerOn || !form.offerValue) return 'Preview';
    if (form.offerType === '% Discount')    return `${form.offerValue}% OFF`;
    if (form.offerType === 'Flat Off (₹)')  return `₹${form.offerValue} OFF`;
    return `BUY ${form.offerValue} GET 1 FREE`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={slot?.name ? `Edit — Slot ${slot?.id}` : `Configure — Slot ${slot?.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Slot</Button>
        </>
      }
    >
      {/* Image upload */}
      <div className={styles.imgUpload}>
        <Upload size={20} color="var(--text-muted)" />
        <span className={styles.imgText}>Tap to upload product image</span>
        <span className={styles.imgSub}>PNG, JPG up to 2MB</span>
      </div>

      {/* Name */}
      <div className={styles.field}>
        <label className={styles.label}>Product Name</label>
        <input
          className={styles.input}
          placeholder="e.g. Coca Cola 250ml"
          value={form.name}
          onChange={e => set('name', e.target.value)}
        />
      </div>

      {/* Price + Stock */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Price (₹)</label>
          <input
            className={styles.input}
            type="number" placeholder="50"
            value={form.price}
            onChange={e => set('price', e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Initial Stock</label>
          <input
            className={styles.input}
            type="number" placeholder="20" max="20"
            value={form.stock}
            onChange={e => set('stock', e.target.value)}
          />
        </div>
      </div>

      {/* Category */}
      <div className={styles.field}>
        <label className={styles.label}>Category</label>
        <select
          className={styles.input}
          value={form.category}
          onChange={e => set('category', e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Enable slot */}
      <div className={styles.toggleRow}>
        <Toggle
          checked={form.enabled}
          onChange={v => set('enabled', v)}
          label="Slot enabled on customer screen"
        />
      </div>

      {/* Offer */}
      <div className={styles.offerSection}>
        <div className={styles.toggleRow}>
          <Toggle checked={offerOn} onChange={setOfferOn} label="Add special offer" />
        </div>
        {offerOn && (
          <div className={styles.offerFields}>
            <select
              className={styles.input}
              value={form.offerType}
              onChange={e => set('offerType', e.target.value)}
            >
              {OFFER_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <div className={styles.row} style={{ marginTop: 10 }}>
              <input
                className={styles.input}
                placeholder="Value"
                value={form.offerValue}
                onChange={e => set('offerValue', e.target.value)}
              />
              <div className={styles.preview}>{offerPreview()}</div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SlotModal;
