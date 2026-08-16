import { useState, useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AdminNav from './AdminNav';
import { SectionHeading } from './Primitives';
import { useFirestoreQuery } from '../hooks/useFirestore';
import { db } from '../lib/firebase';
import { doc, addDoc, deleteDoc, updateDoc, collection, orderBy } from 'firebase/firestore';
import { uploadImage } from '../lib/uploadImage';

const btnStyle = {
  padding: '10px 18px',
  border: '2px solid var(--ink)',
  fontFamily: "'Archivo Black', sans-serif",
  letterSpacing: '.1em', textTransform: 'uppercase', fontSize: 11,
  cursor: 'pointer', boxShadow: '3px 3px 0 var(--ink)',
};

const SortablePhoto = ({ photo, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{
        background: 'white', border: '2px solid var(--ink)',
        boxShadow: '4px 4px 0 var(--ink)', padding: 8, cursor: 'grab',
      }}>
        {photo.thumbUrl ? (
          <img src={photo.thumbUrl} alt={photo.caption} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: 150, background: 'var(--paper-2)',
            display: 'grid', placeItems: 'center',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--ink-soft)',
          }}>[ no image ]</div>
        )}
        <div style={{
          fontFamily: "'Kalam', cursive", fontSize: 13, marginTop: 6,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{photo.caption}</div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(photo); }}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: 4, right: 4,
          background: 'var(--pink)', border: '1.5px solid var(--ink)',
          width: 24, height: 24, display: 'grid', placeItems: 'center',
          fontFamily: "'Archivo Black', sans-serif", fontSize: 14,
          cursor: 'pointer', lineHeight: 1, padding: 0,
        }}>&times;</button>
    </div>
  );
};

const GalleryEditor = () => {
  const { data: photos, loading } = useFirestoreQuery('gallery', [orderBy('sortOrder')], 'gallery');
  const [adding, setAdding] = useState(false);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const photoIds = useMemo(() => photos.map(p => p.id), [photos]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex(p => p.id === active.id);
    const newIndex = photos.findIndex(p => p.id === over.id);
    const reordered = arrayMove(photos, oldIndex, newIndex);

    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].sortOrder !== i + 1) {
        await updateDoc(doc(db, 'gallery', reordered[i].id), { sortOrder: i + 1 });
      }
    }
  };

  const handleAdd = async () => {
    if (!file || !caption.trim()) return;
    setSaving(true);
    try {
      const id = crypto.randomUUID();
      const url = await uploadImage(file, `gallery/${id}.jpg`, { maxWidth: 1200 });
      await addDoc(collection(db, 'gallery'), {
        caption: caption.trim(),
        thumbUrl: url,
        fullUrl: url,
        sortOrder: photos.length + 1,
      });
      setCaption('');
      setFile(null);
      setAdding(false);
    } catch (err) {
      alert('Error uploading photo: ' + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (photo) => {
    if (!confirm(`Delete "${photo.caption}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'gallery', photo.id));
  };

  if (loading) return null;

  return (
    <div style={{ padding: '28px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <AdminNav />
      <SectionHeading kicker="officer tools" title="Gallery" rotate={-1} />

      <button onClick={() => setAdding(!adding)} style={{ ...btnStyle, background: 'var(--green)', marginTop: 24 }}>
        + Add Photo
      </button>

      {adding && (
        <div style={{
          marginTop: 18, background: 'white', border: '2px solid var(--ink)',
          padding: '24px 28px', boxShadow: '6px 6px 0 var(--ink)',
        }}>
          <div style={{ fontFamily: "'Alfa Slab One', serif", fontSize: 22, marginBottom: 18 }}>add photo</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
            <label>
              <span style={{
                display: 'block', fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase',
                color: 'var(--ink-soft)', marginBottom: 6,
              }}>photo *</span>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0] || null)} style={{
                fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14,
              }} />
            </label>
            <label>
              <span style={{
                display: 'block', fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase',
                color: 'var(--ink-soft)', marginBottom: 6,
              }}>caption *</span>
              <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g. Spring mixer 2026" style={{
                width: '100%', padding: '10px 14px', border: '2px solid var(--ink)',
                background: 'var(--paper)', fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 15, boxSizing: 'border-box',
              }} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleAdd} disabled={saving} style={{ ...btnStyle, background: 'var(--green)' }}>
              {saving ? 'uploading...' : 'save'}
            </button>
            <button onClick={() => { setAdding(false); setFile(null); setCaption(''); }} style={{ ...btnStyle, background: 'white' }}>cancel</button>
          </div>
        </div>
      )}

      {photos.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', fontFamily: "'Kalam', cursive", fontSize: 22, color: 'var(--ink-soft)', marginTop: 28 }}>
          no photos yet — add one above
        </div>
      ) : (
        <>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '.15em',
            textTransform: 'uppercase', color: 'var(--ink-soft)', marginTop: 24,
          }}>drag to reorder &middot; {photos.length} photo{photos.length !== 1 ? 's' : ''}</div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={photoIds} strategy={rectSortingStrategy}>
              <div style={{
                marginTop: 14, display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)', gap: 18,
              }}>
                {photos.map(p => (
                  <SortablePhoto key={p.id} photo={p} onDelete={handleDelete} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
};

export default GalleryEditor;
