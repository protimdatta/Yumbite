import mongoose from 'mongoose';

// Atomic counters (order numbers, etc.) — findOneAndUpdate $inc
// guarantees uniqueness even under concurrent checkouts.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. 'order-2026'
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Next order number like YB-2026-000123 (sequence resets each year)
export async function nextOrderNumber() {
  const year = new Date().getFullYear();
  const doc = await Counter.findOneAndUpdate(
    { _id: `order-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `YB-${year}-${String(doc.seq).padStart(6, '0')}`;
}

// Next invoice number like YB-INV-10001 (separate sequence from orders)
export async function nextInvoiceNumber() {
  // Ensure the sequence starts at 10000 (first invoice -> 10001)
  await Counter.updateOne({ _id: 'invoice-global' }, { $max: { seq: 10000 } }, { upsert: true });
  const doc = await Counter.findOneAndUpdate(
    { _id: 'invoice-global' },
    { $inc: { seq: 1 } },
    { new: true }
  );
  return `YB-INV-${doc.seq}`;
}

export default Counter;
