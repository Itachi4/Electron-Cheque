// frontend/src/app/components/pending-cheques-queue/pending-cheques-queue.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChequeService } from '../../services/cheque.service'; // Adjust path if necessary
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pending-cheques-queue',
  standalone: true,
  imports: [CommonModule, FormsModule], // Import necessary modules
  templateUrl: './pending-cheques-queue.component.html',
  styleUrls: ['./pending-cheques-queue.component.scss']
})
export class PendingChequesQueueComponent implements OnInit, OnDestroy {
  pendingCheques: any[] = [];
  selectedCheque: any = null;
  pollingInterval: any;

  // Data for dropdowns
  companies: any[] = [];
  banks: any[] = [];
  accounts: any[] = [];
  selectedCompanyId: number | null = null;
  selectedBankId: number | null = null;
  selectedAccountId: number | null = null;

  constructor(private chequeService: ChequeService) { }

  ngOnInit(): void {
    this.fetchPendingCheques();
    // Poll the backend every 10 seconds for new cheques
    this.pollingInterval = setInterval(() => {
      this.fetchPendingCheques();
    }, 10000);

    // Load companies for the dropdown
    this.loadCompanies();
  }

  ngOnDestroy(): void {
    // Important: clear the interval when the component is destroyed to prevent memory leaks
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  fetchPendingCheques(): void {
    this.chequeService.getPendingCheques().subscribe(data => {
      this.pendingCheques = data;
    });
  }

  // --- Logic for dropdowns (reused from your cheque-generator component) ---
  loadCompanies(): void {
    // Assuming your service has these methods from your other components
    this.chequeService.getCompanies().subscribe(data => this.companies = data);
  }

  onCompanyChange(companyId: any): void {
    this.selectedBankId = null;
    this.selectedAccountId = null;
    this.banks = [];
    this.accounts = [];
    if (companyId) {
      this.chequeService.getBanks(companyId).subscribe(data => this.banks = data);
    }
  }

  onBankChange(bankId: any): void {
    this.selectedAccountId = null;
    this.accounts = [];
    if (bankId) {
      this.chequeService.getAccounts(bankId).subscribe(data => this.accounts = data);
    }
  }

  // --- Action Handlers ---
  selectChequeForReview(cheque: any): void {
    this.selectedCheque = cheque;
    // Reset selections when a new cheque is reviewed
    this.selectedCompanyId = null;
    this.selectedBankId = null;
    this.selectedAccountId = null;
  }

  processSelectedCheque(): void {
    if (!this.selectedCheque || !this.selectedAccountId) {
      alert('Please select a cheque and an account first.');
      return;
    }

    this.chequeService.processPendingCheque(this.selectedCheque.id, this.selectedAccountId)
      .subscribe({
        next: (response) => {
          alert('Cheque processed successfully!');
          console.log('Server response:', response);
          this.selectedCheque = null; // Close the modal/review section
          this.fetchPendingCheques(); // Refresh the list immediately
        },
        error: (err) => {
          alert('Error processing cheque. See console for details.');
          console.error(err);
        }
      });
  }

  cancelReview(): void {
    this.selectedCheque = null;
  }
}