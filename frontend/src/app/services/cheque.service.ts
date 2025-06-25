import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
    id: number;
    name: string;
}

export interface Bank {
    id: number;
    name: string;
    companyId: number;
    routingNumber: string;
}

export interface Account {
    id: number;
    number: string;
    bankId: number;
    lastCheck: number;
    company?: { id: number; name: string };
}

export interface ChequeTemplate {
    id: number;
    name: string;
    companyId: number;
    bankId: number;
    background: string;
    fieldMap: any;
}

export interface GenerationRecord {
    id: number;
    companyId: number;
    accountId: number;
    startNumber: number;
    endNumber: number;
    generatedAt: Date;
    pdfPath: string;
}

export interface GeneratedChequeResponse {
    message: string;
    pdfPath: string;
    startNumber: number;
    endNumber: number;
}

export interface LoginResponse {
    message: string;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChequeService {
    //private apiUrl = 'http://localhost:3000/api';
     private apiUrl = '/api';

    constructor(private http: HttpClient) { }

    getCompanies(): Observable<Company[]> {
        return this.http.get<Company[]>(`${this.apiUrl}/companies`);
    }

    getBanks(companyId: number): Observable<Bank[]> {
        return this.http.get<Bank[]>(`${this.apiUrl}/banks/${companyId}`);
    }

    getAccounts(bankId: number): Observable<Account[]> {
        return this.http.get<Account[]>(`${this.apiUrl}/accounts/${bankId}`);
    }

    getLastCheque(accountId: number): Observable<{ lastCheque: number }> {
        return this.http.get<{ lastCheque: number }>(`${this.apiUrl}/last-cheque/${accountId}`);
    }

    getTemplate(companyId: number, bankId: number): Observable<ChequeTemplate> {
        return this.http.get<ChequeTemplate>(`${this.apiUrl}/templates/${companyId}/${bankId}`);
    }

    login(email: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
    }

    generateCheques(accountId: number, count: number): Observable<GeneratedChequeResponse> {
        return this.http.post<GeneratedChequeResponse>(`${this.apiUrl}/generate`, { accountId, count });
    }

    updateLastCheque(accountId: number, lastCheck: number) {
        return this.http.patch(`${this.apiUrl}/accounts/${accountId}/last-cheque`, { lastCheck });
    }
} 