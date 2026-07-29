'use client';

import { useState, useRef } from 'react';
import { Star, Upload, X, Loader2 } from 'lucide-react';
import apiClient from '@/lib/apiClient';

const MAX_IMAGES = 5;
const MAX_MB = 5;

/**
 * ReviewForm
 * Props:
 *   productId  — string
 *   onSuccess  — (review) => void — called after successful submission
 *   onCancel   — () => void — optional, shown when editing
 *   initialData — existing review object (for edit mode)
 */
export default function ReviewForm({ productId, onSuccess, onCancel, initialData }) {
  const isEdit = Boolean(initialData);

  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');

  // New files selected by user
  const [newFiles, setNewFiles] = useState([]); // File objects
  const [newPreviews, setNewPreviews] = useState([]); // data URL strings

  // Existing images (edit mode) — may be removed
  const [existingImages, setExistingImages] = useState(initialData?.images || []);
  const [removedPublicIds, setRemovedPublicIds] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const totalImages = existingImages.length + newFiles.length;

  const addFiles = (files) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const valid = Array.from(files).filter((f) => {
      if (!allowed.includes(f.type)) { setError(`"${f.name}" is not a valid image type.`); return false; }
      if (f.size > MAX_MB * 1024 * 1024) { setError(`"${f.name}" exceeds ${MAX_MB} MB.`); return false; }
      return true;
    });

    const remaining = MAX_IMAGES - totalImages;
    const toAdd = valid.slice(0, remaining);
    if (valid.length > remaining) setError(`Max ${MAX_IMAGES} images per review.`);

    setNewFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setNewPreviews((prev) => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeNewFile = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (img) => {
    setExistingImages((prev) => prev.filter((i) => i.publicId !== img.publicId));
    setRemovedPublicIds((prev) => [...prev, img.publicId]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rating) { setError('Please select a star rating.'); return; }
    if (!comment.trim()) { setError('Please write a review comment.'); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (!isEdit) formData.append('productId', productId);
      formData.append('rating', rating);
      formData.append('title', title);
      formData.append('comment', comment);
      newFiles.forEach((file) => formData.append('images', file));
      if (isEdit) {
        removedPublicIds.forEach((pid) => formData.append('removeImageIds', pid));
      }

      let res;
      if (isEdit) {
        res = await apiClient.put(`/reviews/${initialData._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await apiClient.post('/reviews', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      onSuccess(res.data.review);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-[var(--clx-border-light)] p-6 shadow-[var(--clx-shadow-sm)]"
    >
      <h3 className="font-serif text-lg font-semibold text-[var(--clx-text-primary)] mb-5">
        {isEdit ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      {/* Star Rating Selector */}
      <div className="mb-5">
        <label className="block text-xs font-semibold tracking-wider uppercase text-[var(--clx-text-secondary)] mb-2">
          Your Rating <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              id={`review-star-${star}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-[var(--clx-gold)] text-[var(--clx-gold)]'
                    : 'text-[var(--clx-border)]'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 self-center text-sm text-[var(--clx-text-secondary)]">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-xs font-semibold tracking-wider uppercase text-[var(--clx-text-secondary)] mb-1.5">
          Review Title <span className="text-[var(--clx-text-muted)] font-normal">(optional)</span>
        </label>
        <input
          id="review-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarise your experience"
          maxLength={100}
          className="w-full px-4 py-2.5 rounded-lg border border-[var(--clx-border)] bg-[var(--clx-surface)] text-sm text-[var(--clx-text-primary)] placeholder-[var(--clx-text-muted)] focus:outline-none focus:border-[var(--clx-gold)] transition-colors"
        />
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label className="block text-xs font-semibold tracking-wider uppercase text-[var(--clx-text-secondary)] mb-1.5">
          Your Review <span className="text-red-400">*</span>
        </label>
        <textarea
          id="review-comment-input"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your honest experience with this timepiece..."
          rows={4}
          maxLength={2000}
          className="w-full px-4 py-2.5 rounded-lg border border-[var(--clx-border)] bg-[var(--clx-surface)] text-sm text-[var(--clx-text-primary)] placeholder-[var(--clx-text-muted)] focus:outline-none focus:border-[var(--clx-gold)] transition-colors resize-none"
        />
        <p className="text-right text-xs text-[var(--clx-text-muted)] mt-1">{comment.length}/2000</p>
      </div>

      {/* Image Upload */}
      <div className="mb-5">
        <label className="block text-xs font-semibold tracking-wider uppercase text-[var(--clx-text-secondary)] mb-2">
          Add Photos <span className="text-[var(--clx-text-muted)] font-normal">(up to {MAX_IMAGES})</span>
        </label>

        {/* Existing images (edit mode) */}
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {existingImages.map((img) => (
              <div key={img.publicId} className="relative group w-20 h-20">
                <img src={img.url} alt="Review photo" className="w-full h-full object-cover rounded-lg border border-[var(--clx-border-light)]" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New previews */}
        {newPreviews.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {newPreviews.map((src, i) => (
              <div key={i} className="relative group w-20 h-20">
                <img src={src} alt="Preview" className="w-full h-full object-cover rounded-lg border border-[var(--clx-gold)]/40" />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow"
                  aria-label="Remove preview"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Drop zone */}
        {totalImages < MAX_IMAGES && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-6 cursor-pointer transition-colors ${
              dragOver
                ? 'border-[var(--clx-gold)] bg-[var(--clx-gold)]/5'
                : 'border-[var(--clx-border)] hover:border-[var(--clx-gold)] bg-[var(--clx-surface)]'
            }`}
            id="review-image-dropzone"
          >
            <Upload className="w-6 h-6 text-[var(--clx-text-muted)]" />
            <p className="text-sm text-[var(--clx-text-secondary)]">
              Drag & drop or <span className="text-[var(--clx-gold)] font-medium">browse</span>
            </p>
            <p className="text-xs text-[var(--clx-text-muted)]">JPEG, PNG, WebP · max {MAX_MB} MB each</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          id="review-image-input"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          id="review-submit-btn"
          disabled={submitting}
          className="luxury-btn-gold flex-1 py-3 text-sm disabled:opacity-60"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEdit ? 'Saving...' : 'Submitting...'}
            </span>
          ) : isEdit ? 'Save Changes' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 text-sm border border-[var(--clx-border)] rounded-xl hover:border-[var(--clx-gold)] transition-colors text-[var(--clx-text-secondary)]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
