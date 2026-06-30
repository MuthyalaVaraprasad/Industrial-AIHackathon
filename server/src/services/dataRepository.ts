import {
  CollaborationNoteModel, AlertModel, SystemSettingsModel,
} from '../models';
import { isMongoConnected } from '../db/mongodb';
import {
  collaborationNotes as mockNotes,
  alerts as mockAlerts,
  systemSettings as mockSettings,
  adminUsers,
} from '../data/mockData';

export async function getCollaborationNotes() {
  if (isMongoConnected()) {
    const notes = await CollaborationNoteModel.find().sort({ timestamp: -1 }).limit(50).lean();
    if (notes.length) {
      return notes.map((n) => ({
        id: n._id.toString(),
        author: n.author,
        role: n.role,
        assetTag: n.assetTag,
        content: n.content,
        mentions: n.mentions,
        timestamp: n.timestamp.toISOString(),
      }));
    }
    for (const note of mockNotes) {
      await CollaborationNoteModel.create({
        author: note.author,
        role: note.role,
        assetTag: note.assetTag,
        content: note.content,
        mentions: note.mentions,
        timestamp: new Date(note.timestamp),
      });
    }
    return mockNotes;
  }
  return mockNotes;
}

export async function addCollaborationNote(data: {
  author: string;
  role: string;
  assetTag: string;
  content: string;
  mentions: string[];
}) {
  const note = {
    id: `note-${Date.now()}`,
    ...data,
    timestamp: new Date().toISOString(),
  };

  if (isMongoConnected()) {
    const saved = await CollaborationNoteModel.create({
      author: data.author,
      role: data.role,
      assetTag: data.assetTag,
      content: data.content,
      mentions: data.mentions,
    });
    return { ...note, id: saved._id.toString(), timestamp: saved.timestamp.toISOString() };
  }

  mockNotes.unshift(note as typeof mockNotes[0]);
  return note;
}

export async function getAlerts() {
  if (isMongoConnected()) {
    const items = await AlertModel.find().sort({ timestamp: -1 }).lean();
    if (items.length) {
      return items.map((a) => ({
        id: a._id.toString(),
        type: a.type,
        title: a.title,
        description: a.description,
        severity: a.severity,
        timestamp: a.timestamp.toISOString(),
        acknowledged: a.acknowledged,
        assetTag: a.assetTag,
      }));
    }
    for (const alert of mockAlerts) {
      await AlertModel.create({
        type: alert.type,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        timestamp: new Date(alert.timestamp),
        acknowledged: alert.acknowledged,
        assetTag: alert.assetTag,
      });
    }
    return mockAlerts;
  }
  return mockAlerts;
}

export async function acknowledgeAlert(id: string) {
  if (isMongoConnected()) {
    const updated = await AlertModel.findByIdAndUpdate(id, { acknowledged: true }, { new: true }).lean();
    if (updated) {
      return {
        id: updated._id.toString(),
        type: updated.type,
        title: updated.title,
        description: updated.description,
        severity: updated.severity,
        timestamp: updated.timestamp.toISOString(),
        acknowledged: updated.acknowledged,
        assetTag: updated.assetTag,
      };
    }
  }
  const alert = mockAlerts.find((a) => a.id === id);
  if (alert) alert.acknowledged = true;
  return alert;
}

export async function getSystemSettings() {
  if (isMongoConnected()) {
    let settings = await SystemSettingsModel.findOne().lean();
    if (!settings) {
      settings = await SystemSettingsModel.create(mockSettings);
    }
    return {
      geminiModel: settings.geminiModel,
      autoProcessing: settings.autoProcessing,
      alertThreshold: settings.alertThreshold,
      retentionDays: settings.retentionDays,
    };
  }
  return mockSettings;
}

export async function updateSystemSettings(data: Partial<typeof mockSettings>) {
  if (isMongoConnected()) {
    const updated = await SystemSettingsModel.findOneAndUpdate({}, data, { upsert: true, new: true }).lean();
    if (updated) {
      return {
        geminiModel: updated.geminiModel,
        autoProcessing: updated.autoProcessing,
        alertThreshold: updated.alertThreshold,
        retentionDays: updated.retentionDays,
      };
    }
  }
  Object.assign(mockSettings, data);
  return mockSettings;
}

export function getAdminUsers() {
  return adminUsers;
}
