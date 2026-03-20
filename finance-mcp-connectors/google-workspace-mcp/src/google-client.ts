import { google, calendar_v3, sheets_v4, drive_v3 } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

export class GoogleWorkspaceClient {
  private calendar: calendar_v3.Calendar;
  private sheets: sheets_v4.Sheets;
  private drive: drive_v3.Drive;

  constructor() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    this.sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
  }

  // ─── Calendar ───

  async getUpcomingEvents(maxResults: number = 10): Promise<calendar_v3.Schema$Event[]> {
    const res = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.data.items || [];
  }

  async getTodayEvents(): Promise<calendar_v3.Schema$Event[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const res = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.data.items || [];
  }

  async getEventsInRange(startDate: string, endDate: string): Promise<calendar_v3.Schema$Event[]> {
    const res = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(startDate).toISOString(),
      timeMax: new Date(endDate).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.data.items || [];
  }

  async createEvent(params: {
    summary: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    attendees?: string[];
  }): Promise<calendar_v3.Schema$Event> {
    const event: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.startDateTime, timeZone: 'America/Tijuana' },
      end: { dateTime: params.endDateTime, timeZone: 'America/Tijuana' },
      attendees: params.attendees?.map(email => ({ email })),
    };

    const res = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all',
    });
    return res.data;
  }

  // ─── Sheets ───

  async readSheet(spreadsheetId: string, range: string): Promise<string[][]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return (res.data.values as string[][]) || [];
  }

  async writeSheet(spreadsheetId: string, range: string, values: string[][]): Promise<number> {
    const res = await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    return res.data.updatedCells || 0;
  }

  async appendSheet(spreadsheetId: string, range: string, values: string[][]): Promise<number> {
    const res = await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    return res.data.updates?.updatedCells || 0;
  }

  async listSheets(spreadsheetId: string): Promise<{ title: string; sheetId: number }[]> {
    const res = await this.sheets.spreadsheets.get({ spreadsheetId });
    return (res.data.sheets || []).map(s => ({
      title: s.properties?.title || '',
      sheetId: s.properties?.sheetId || 0,
    }));
  }

  // ─── Drive ───

  async searchFiles(query: string, maxResults: number = 10): Promise<drive_v3.Schema$File[]> {
    const res = await this.drive.files.list({
      q: `name contains '${query}' and trashed = false`,
      pageSize: maxResults,
      fields: 'files(id, name, mimeType, modifiedTime, webViewLink, size)',
      orderBy: 'modifiedTime desc',
    });
    return res.data.files || [];
  }

  async listRecentFiles(maxResults: number = 10): Promise<drive_v3.Schema$File[]> {
    const res = await this.drive.files.list({
      pageSize: maxResults,
      fields: 'files(id, name, mimeType, modifiedTime, webViewLink, size)',
      orderBy: 'modifiedTime desc',
      q: 'trashed = false',
    });
    return res.data.files || [];
  }

  async getFileContent(fileId: string): Promise<string> {
    const res = await this.drive.files.export({
      fileId,
      mimeType: 'text/plain',
    });
    return res.data as string;
  }
}
