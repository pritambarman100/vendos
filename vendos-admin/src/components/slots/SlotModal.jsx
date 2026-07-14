import { useState, useEffect } from 'react'
import { Upload, Package, Tag, Hash, Grid, ToggleLeft, Percent, X } from 'lucide-react'
import { useSlotStore } from '../../store/slotStore'
import styles from './SlotModal.module.css'
import imageCompression from 'browser-image-compression';

const CATEGORIES = ['Drinks', 'Snacks', 'Food', 'Stationery', 'Other']
const OFFER_TYPES = ['% Discount', 'Flat Off (₹)', 'Buy X Get Y Free']

const SlotModal = ({ slot, onClose }) => {
  const updateSlot = useSlotStore(s => s.updateSlot)
  const deleteSlot = useSlotStore(s => s.deleteSlot)
  const sales = useSlotStore(s => s.sales)
  const slotsObj = useSlotStore(s => s.slots)

  const [slotId,     setSlotId]     = useState('')
  const [name,       setName]       = useState('')
  const [price,      setPrice]      = useState('')
  const [stock,      setStock]      = useState('')
  const [max,        setMax]        = useState(20)
  const [alertThreshold, setAlertThreshold] = useState(0.20)
  const [category,   setCategory]   = useState('Drinks')
  const [enabled,    setEnabled]    = useState(true)
  const [image,      setImage]      = useState(null)
  const [imageFile,  setImageFile]  = useState(null)
  const [offerOn,    setOfferOn]    = useState(false)
  const [offerType,  setOfferType]  = useState(OFFER_TYPES[0])
  const [offerValue, setOfferValue] = useState('')
  const [bxgyX, setBxgyX] = useState('2')
  const [bxgyY, setBxgyY] = useState('1')
  const [uploading,  setUploading]  = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const [selectedRow, setSelectedRow] = useState('A')
  const [selectedCol, setSelectedCol] = useState('1')

  useEffect(() => {
    setShowConfirmDelete(false)
    if (slot) {
      const currentId = slot.id || ''
      setSlotId(currentId)
      if (currentId) {
        const row = currentId.charAt(0).toUpperCase()
        const col = parseInt(currentId.slice(1), 10)
        setSelectedRow(row)
        setSelectedCol(isNaN(col) ? '1' : String(col))
      } else {
        setSelectedRow('A')
        setSelectedCol('1')
      }
      setName(slot.name || '')
      setPrice(slot.price || '')
      setStock(slot.stock || '')
      setMax(slot.max || 20)
      setAlertThreshold(slot.alertThreshold || 0.20)
      setCategory(slot.category || 'Drinks')
      setEnabled(slot.name ? (slot.enabled ?? true) : true)
      setImage(slot.image || null)
      setImageFile(null)
      setOfferOn(!!slot.offer)
      setOfferType(slot.offer?.type || OFFER_TYPES[0])
      if (slot.offer?.type === 'Buy X Get Y Free' && slot.offer?.value) {
        const parts = slot.offer.value.split('+')
        if (parts.length === 2) {
          setBxgyX(parts[0])
          setBxgyY(parts[1])
        } else {
          setOfferValue(slot.offer.value)
        }
      } else {
        setOfferValue(slot.offer?.value || '')
      }
    }
  }, [slot])

  useEffect(() => {
    if (slot && slot.isNew) {
      const colNum = parseInt(selectedCol, 10)
      const paddedCol = colNum < 10 ? `0${colNum}` : String(colNum)
      setSlotId(`${selectedRow}${paddedCol}`)
    }
  }, [selectedRow, selectedCol, slot?.isNew])

  const handleImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    console.log('Original file size:', file.size / 1024 / 1024, 'MB');

    const options = {
      maxSizeMB: 0.05,          // Automatically restricts file size to a maximum of 50KB
      maxWidthOrHeight: 400,   // Automatically resizes resolution to a max of 400px width/height
      useWebWorker: true
    };

    try {
      const compressionPromise = imageCompression(file, options);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Image compression timeout")), 5000)
      );

      const compressedFile = await Promise.race([compressionPromise, timeoutPromise]);
      console.log('Compressed file size:', compressedFile.size / 1024, 'KB');
      
      setImageFile(compressedFile)
      const reader = new FileReader()
      reader.onload = (ev) => setImage(ev.target.result)
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('Image compression failed or timed out, falling back to original file:', error);
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setImage(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const offerPreview = () => {
    if (offerType === 'Buy X Get Y Free') {
      return `BUY ${bxgyX} GET ${bxgyY} FREE`
    }
    if (!offerValue) return 'Preview'
    if (offerType === '% Discount')   return `${offerValue}% OFF`
    if (offerType === 'Flat Off (₹)') return `₹${offerValue} OFF`
    return `BUY ${offerValue} GET 1 FREE`
  }

  const handleDeleteClick = () => {
    setShowConfirmDelete(true)
  }

  const handleConfirmDelete = () => {
    if (!slot) return
    deleteSlot(slot.id)
    onClose()
  }

  const handleCancelDelete = () => {
    setShowConfirmDelete(false)
  }

  const handleSave = async () => {
    if (!slot) return
    const finalId = slot.isNew ? slotId.trim().toUpperCase() : slot.id
    if (!finalId) {
      alert("Chamber Code / Slot ID cannot be empty!")
      return
    }
    if (!name.trim()) {
      alert("Product Name cannot be empty!")
      return
    }

    setUploading(true)
    let finalImageUrl = image

    try {

      const numStock = Number(stock)
      const numMax = Number(max)
      const numThreshold = Number(alertThreshold)
      
      await updateSlot(finalId, {
        name,
        price:  Number(price),
        stock:  numStock,
        max:    numMax,
        alertThreshold: numThreshold,
        category,
        enabled,
        image: finalImageUrl,
        status:
          numStock === 0 ? 'empty' :
          numStock <= (numMax * numThreshold) ? 'low' : 'ok',
        offer: offerOn
          ? { 
              type: offerType, 
              value: offerType === 'Buy X Get Y Free' ? `${bxgyX || '2'}+${bxgyY || '1'}` : offerValue 
            }
          : null,
      })
      onClose()
    } catch (err) {
      console.error("Save Failed:", err);
      alert("Failed to save slot. Please check your network connection.");
    } finally {
      setUploading(false)
    }
  }

  if (!slot) return null

  // Duplicate checker - formats to check A01 or A1 to avoid double inputs
  const isDuplicate = slot.isNew && (
    (slotsObj[slotId] !== undefined && slotsObj[slotId].name !== '') ||
    (slotsObj[slotId.replace(/^([A-Z])0/, '$1')] !== undefined && slotsObj[slotId.replace(/^([A-Z])0/, '$1')].name !== '')
  )

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.slotBadge}>{slot.id || slotId}</div>
            <h2 className={styles.title}>Configure Slot</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* Image upload */}
          <label className={styles.imgUpload}>
            {image ? (
              <img src={image} alt="product" className={styles.imgPreview} />
            ) : (
              <div className={styles.imgPlaceholder}>
                <div className={styles.uploadIcon}>
                  <Upload size={22} color="var(--text-muted)" />
                </div>
                <span className={styles.imgText}>Upload product image</span>
                <span className={styles.imgSub}>This shows on customer touchscreen</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              style={{ display: 'none' }}
            />
          </label>
          {image && (
            <button className={styles.removeImg} onClick={() => { setImage(null); setImageFile(null); }}>
              Remove image
            </button>
          )}

          {/* Chamber / Slot ID */}
          <div className={styles.field}>
            <label className={styles.label}>
              <Hash size={12} />
              Chamber Code / Slot ID
            </label>
            {slot.isNew ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    className={styles.input}
                    style={{ flex: 1 }}
                    value={selectedRow}
                    onChange={e => setSelectedRow(e.target.value)}
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(r => (
                      <option key={r} value={r}>Row {r}</option>
                    ))}
                  </select>
                  <select
                    className={styles.input}
                    style={{ flex: 1 }}
                    value={selectedCol}
                    onChange={e => setSelectedCol(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5].map(c => (
                      <option key={c} value={String(c)}>Column {c}</option>
                    ))}
                  </select>
                  <div style={{ 
                    fontFamily: 'var(--font-head)', 
                    fontWeight: '700', 
                    fontSize: '13px', 
                    color: 'var(--accent)', 
                    padding: '10px 14px', 
                    background: 'rgba(212, 255, 58, 0.08)',
                    border: '1px solid var(--accent)',
                    borderRadius: 'var(--radius-md)',
                    minWidth: '50px',
                    textAlign: 'center'
                  }}>
                    {slotId}
                  </div>
                </div>
                {isDuplicate && (
                  <div style={{ 
                    fontSize: '11px', 
                    color: 'var(--danger)', 
                    background: 'rgba(231,76,60,0.08)', 
                    border: '1px solid rgba(231,76,60,0.15)', 
                    padding: '8px 12px', 
                    borderRadius: 'var(--radius-sm)',
                    lineHeight: 1.4,
                    marginTop: '4px'
                  }}>
                    ⚠️ Chamber slot {slotId} already has a product. You must delete the existing slot before registering it again.
                  </div>
                )}
              </div>
            ) : (
              <input
                className={styles.input}
                value={slotId}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed', backgroundColor: 'rgba(255,255,255,0.03)' }}
              />
            )}
          </div>

          {/* Product name */}
          <div className={styles.field}>
            <label className={styles.label}>
              <Package size={12} />
              Product Name
            </label>
            <input
              className={styles.input}
              placeholder="e.g. Coca Cola 250ml"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Price + Stock */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>
                <Tag size={12} />
                Price (₹)
              </label>
              <input
                className={styles.input}
                type="number"
                placeholder="50"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                <Hash size={12} />
                Stock Count
              </label>
              <input
                className={styles.input}
                type="number"
                placeholder="0"
                max={max}
                value={stock}
                onChange={e => setStock(e.target.value)}
              />
            </div>
          </div>

          {/* Dynamic Max Capacity + Alert Threshold */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>
                <Hash size={12} />
                Max Capacity
              </label>
              <input
                className={styles.input}
                type="number"
                placeholder="20"
                value={max}
                onChange={e => setMax(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                <Percent size={12} />
                Alert Threshold
              </label>
              <select
                className={styles.input}
                value={alertThreshold}
                onChange={e => setAlertThreshold(Number(e.target.value))}
              >
                <option value={0.10}>10% of Capacity</option>
                <option value={0.20}>20% of Capacity</option>
                <option value={0.25}>25% of Capacity</option>
                <option value={0.30}>30% of Capacity</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div className={styles.field}>
            <label className={styles.label}>
              <Grid size={12} />
              Category
            </label>
            <select
              className={styles.input}
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Enable slot */}
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <ToggleLeft size={15} color="var(--text-muted)" />
              <div>
                <div className={styles.toggleTitle}>Show on customer screen</div>
                <div className={styles.toggleSub}>Customers can see and buy this product</div>
              </div>
            </div>
            <div
              className={[styles.toggle, enabled ? styles.on : ''].join(' ')}
              onClick={() => setEnabled(!enabled)}
            >
              <div className={styles.thumb} />
            </div>
          </div>

          {/* Offer section */}
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <Percent size={15} color="var(--text-muted)" />
              <div>
                <div className={styles.toggleTitle}>Add special offer</div>
                <div className={styles.toggleSub}>Show discount badge on product</div>
              </div>
            </div>
            <div
              className={[styles.toggle, offerOn ? styles.on : ''].join(' ')}
              onClick={() => setOfferOn(!offerOn)}
            >
              <div className={styles.thumb} />
            </div>
          </div>

          {offerOn && (
            <div className={styles.offerFields}>
              <select
                className={styles.input}
                value={offerType}
                onChange={e => setOfferType(e.target.value)}
              >
                {OFFER_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              {offerType === 'Buy X Get Y Free' ? (
                <div className={styles.row} style={{ marginTop: 10, alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Buy</span>
                    <input
                      className={styles.input}
                      style={{ padding: '6px 8px', textAlign: 'center' }}
                      type="number"
                      placeholder="2"
                      value={bxgyX}
                      min={1}
                      onChange={e => setBxgyX(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Get</span>
                    <input
                      className={styles.input}
                      style={{ padding: '6px 8px', textAlign: 'center' }}
                      type="number"
                      placeholder="1"
                      value={bxgyY}
                      min={1}
                      onChange={e => setBxgyY(e.target.value)}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Free</span>
                </div>
              ) : (
                <div className={styles.row} style={{ marginTop: 10 }}>
                  <input
                    className={styles.input}
                    placeholder="Enter value"
                    value={offerValue}
                    onChange={e => setOfferValue(e.target.value)}
                  />
                  <div className={styles.offerPreview}>
                    {offerPreview()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chamber statistics and sales history section */}
          {!slot.isNew && (
            <div className={styles.statsSection}>
              <h3 className={styles.sectionTitle}>Chamber Performance & Activity</h3>
              <div className={styles.statsRow}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Current Stock</span>
                  <span className={styles.statVal}>{stock} / {max}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Units Sold</span>
                  <span className={styles.statVal}>
                    {sales.filter(s => s.slot_id === slot.id || s.slot === slot.id).length}
                  </span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Total Revenue</span>
                  <span className={styles.statVal} style={{ color: 'var(--accent)' }}>
                    ₹{sales.filter(s => s.slot_id === slot.id || s.slot === slot.id).reduce((sum, s) => sum + (s.price_paid || s.price || 0), 0)}
                  </span>
                </div>
              </div>

              {/* Slot Sales History list */}
              <div className={styles.historyList}>
                <span className={styles.historyTitle}>Recent Slot Transactions</span>
                {sales.filter(s => s.slot_id === slot.id || s.slot === slot.id).length === 0 ? (
                  <div className={styles.noHistory}>No sales recorded for this chamber yet.</div>
                ) : (
                  sales.filter(s => s.slot_id === slot.id || s.slot === slot.id).slice(0, 3).map(s => {
                    const dateVal = s.timestamp ? new Date(s.timestamp) : new Date();
                    return (
                      <div key={s.id || Math.random()} className={styles.historyRow}>
                        <span className={styles.historyTime}>
                          {isNaN(dateVal.getTime()) ? s.timestamp : dateVal.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={styles.historyPrice}>₹{s.price_paid || s.price}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {showConfirmDelete ? (
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 'bold' }}>
                ⚠️ Delete product from slot {slot.id}?
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={styles.cancelBtn} 
                  onClick={handleCancelDelete}
                  style={{ padding: '8px 12px' }}
                >
                  Cancel
                </button>
                <button 
                  className={styles.saveBtn} 
                  onClick={handleConfirmDelete}
                  style={{ 
                    background: 'var(--danger)', 
                    color: 'white', 
                    borderColor: 'var(--danger)',
                    padding: '8px 12px'
                  }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          ) : (
            <>
              {!slot.isNew && (
                <button 
                  className={styles.cancelBtn} 
                  onClick={handleDeleteClick}
                  style={{
                    marginRight: 'auto',
                    borderColor: 'var(--danger)',
                    color: 'var(--danger)',
                    background: 'rgba(248,81,73,0.05)'
                  }}
                >
                  Delete Slot
                </button>
              )}
              <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={isDuplicate || uploading}>
                {uploading ? 'Saving...' : 'Save Slot'}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

export default SlotModal