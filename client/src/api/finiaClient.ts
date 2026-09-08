import {
  TransactionFilters,
  PaginatedTransactions,
  CreateTransactionPayload,
  TransactionUpdatePayload,
  Transaction,
  PdfImportResponse,
  PdfUploadFile,
} from "./transaction.api";
import {
  DeviceContactItem,
  ContactSyncResponse,
  ContactFilters,
  GetContactsResponse,
} from "./contact.api";

const DEFAULT_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/v1";

/**
 * Standalone API client for Transaction and Contact endpoints.
 * Usable by AI agents, background workers, or custom integrations.
 */
export class FiniaClient {
  private baseUrl: string;

  constructor(private token: string, baseUrl?: string) {
    this.baseUrl = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  // ─── Transaction Endpoints ───────────────────────────────────────────────────

  /** Upload bank statement PDF */
  async importPdfStatement(
    file: PdfUploadFile | Blob | FormData,
    filename = "statement.pdf"
  ): Promise<PdfImportResponse> {
    let formData: FormData;

    if (file instanceof FormData) {
      formData = file;
    } else if ("uri" in file) {
      formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name || filename,
        type: file.type || "application/pdf",
      } as any);
    } else {
      formData = new FormData();
      formData.append("file", file, filename);
    }

    const res = await fetch(`${this.baseUrl}/transaction/import/pdf`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    const json = await res.json();
    return json.data;
  }

  /** Query transactions with pagination and filters */
  async getTransactions(
    params?: TransactionFilters
  ): Promise<PaginatedTransactions> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, String(value));
        }
      });
    }

    const url = `${this.baseUrl}/transaction${query.toString() ? `?${query}` : ""}`;
    const res = await fetch(url, { headers: this.headers });
    const json = await res.json();
    return json.data;
  }

  /** Get single transaction by ID */
  async getTransactionById(transactionId: string): Promise<Transaction> {
    const res = await fetch(`${this.baseUrl}/transaction/${transactionId}`, {
      headers: this.headers,
    });
    const json = await res.json();
    return json.data;
  }

  /** Create manual transaction */
  async createTransaction(
    payload: CreateTransactionPayload
  ): Promise<Transaction> {
    const res = await fetch(`${this.baseUrl}/transaction`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return json.data;
  }

  /** Update an existing transaction */
  async updateTransaction(
    transactionId: string,
    payload: TransactionUpdatePayload
  ): Promise<Transaction> {
    const res = await fetch(`${this.baseUrl}/transaction/${transactionId}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return json.data;
  }

  /** Delete transaction */
  async deleteTransaction(transactionId: string): Promise<void> {
    await fetch(`${this.baseUrl}/transaction/${transactionId}`, {
      method: "DELETE",
      headers: this.headers,
    });
  }

  // ─── Contact Endpoints ───────────────────────────────────────────────────────

  /** Sync contacts from device */
  async syncContacts(
    contacts: DeviceContactItem[]
  ): Promise<ContactSyncResponse> {
    const res = await fetch(`${this.baseUrl}/contacts/sync`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ contacts }),
    });
    const json = await res.json();
    return json.data;
  }

  /** Query user's synced contacts */
  async getContacts(params?: ContactFilters): Promise<GetContactsResponse> {
    const query = new URLSearchParams();
    if (params) {
      if (params.search) query.append("search", params.search);
      if (params.page) query.append("page", String(params.page));
      if (params.limit) query.append("limit", String(params.limit));
    }

    const url = `${this.baseUrl}/contacts${query.toString() ? `?${query}` : ""}`;
    const res = await fetch(url, { headers: this.headers });
    const json = await res.json();
    return json.data;
  }
}
