import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  companies: any[] = [];
  banks: any[] = [];
  accounts: any[] = [];

  selectedCompany: string = '';
  selectedBank: string = '';
  selectedAccount: string = '';
  nextChequeNumber: number | null = null

  payeeName = '';
  amount = '';
  memo = '';
  ;

  constructor(private http: HttpClient) {
    this.http.get('http://localhost:3000/api/companies').subscribe((res: any) => {
      this.companies = res;
    });
  }

  onCompanyChange() {
    const id = parseInt(this.selectedCompany);
    if (!id) return;
    this.banks = [];
    this.accounts = [];

    this.http.get(`http://localhost:3000/api/banks/${id}`).subscribe({
      next: (res: any) => this.banks = res,
      error: (err) => console.error('Bank fetch error:', err)
    });
  }

  onBankChange() {
    const id = parseInt(this.selectedBank);
    if (!id) return;

    this.accounts = [];  // Clear previous accounts

    this.http.get(`http://localhost:3000/api/accounts/${id}`).subscribe({
      next: (res: any) => this.accounts = res,
      error: (err) => console.error('Account fetch error:', err)
    });
  }

  onAccountChange() {
    const accountId = parseInt(this.selectedAccount);
    if (!accountId) return;

    this.http.get(`http://localhost:3000/api/last-cheque/${accountId}`)
      .subscribe({
        next: (res: any) => {
          this.nextChequeNumber = res.lastCheque + 1; // Auto-increment
        },
        error: (err) => console.error('Cheque number fetch error:', err)
      });
  }
}

