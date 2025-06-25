import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import { ChequeService, Company, Bank, Account, ChequeTemplate } from '../../services/cheque.service';

@Component({
    selector: 'app-cheque-generator',
    templateUrl: './cheque-generator.component.html',
    styleUrls: ['./cheque-generator.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatListModule,
        MatIconModule,
        FormsModule
    ]
})
export class ChequeGeneratorComponent implements OnInit {
    chequeForm: FormGroup;
    companies: Company[] = [];
    banks: Bank[] = [];
    accounts: Account[] = [];
    selectedTemplate: ChequeTemplate | null = null;
    lastChequeNumber: number = 0;
    isGenerating: boolean = false;
    generationHistory: any[] = [];
    updateChequeNumberValue: number | null = null;
    updateChequeNumberError: string = '';
    updateChequeNumberSuccess: string = '';
    safeTemplateUrl: SafeResourceUrl | null = null;

    constructor(
        private fb: FormBuilder,
        private chequeService: ChequeService,
        private router: Router,
        private sanitizer: DomSanitizer
    ) {
        this.chequeForm = this.fb.group({
            companyId: ['', Validators.required],
            bankId: ['', Validators.required],
            accountId: ['', Validators.required],
            chequeCount: ['', [Validators.required, Validators.min(1)]]
        });
    }

    ngOnInit() {
        this.loadCompanies();
        this.setupFormListeners();
    }

    private loadCompanies() {
        this.chequeService.getCompanies().subscribe(
            companies => this.companies = companies,
            error => console.error('Error loading companies:', error)
        );
    }

    private setupFormListeners() {
        this.chequeForm.get('companyId')?.valueChanges.subscribe(companyId => {
            if (companyId) {
                this.loadBanks(companyId);
                this.chequeForm.patchValue({ bankId: '', accountId: '' });
            }
        });

        this.chequeForm.get('bankId')?.valueChanges.subscribe(bankId => {
            if (bankId) {
                this.loadAccounts(bankId);
                this.loadTemplate(
                    this.chequeForm.get('companyId')?.value,
                    bankId
                );
                this.chequeForm.patchValue({ accountId: '' });
            }
        });

        this.chequeForm.get('accountId')?.valueChanges.subscribe(accountId => {
            if (accountId) {
                this.loadLastChequeNumber(accountId);
            }
        });
    }

    private loadBanks(companyId: number) {
        this.chequeService.getBanks(companyId).subscribe(
            banks => this.banks = banks,
            error => console.error('Error loading banks:', error)
        );
    }

    private loadAccounts(bankId: number) {
        this.chequeService.getAccounts(bankId).subscribe(
            accounts => this.accounts = accounts,
            error => console.error('Error loading accounts:', error)
        );
    }

    private loadTemplate(companyId: number, bankId: number) {
        this.chequeService.getTemplate(companyId, bankId).subscribe(
            template => {
                if (template) {
                    this.selectedTemplate = { ...template, background: `http://90.0.0.6:3000/${template.background}` };
                    if (this.selectedTemplate.background.endsWith('.pdf')) {
                        this.safeTemplateUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.selectedTemplate.background);
                    } else {
                        this.safeTemplateUrl = null;
                    }
                } else {
                    this.selectedTemplate = null;
                    this.safeTemplateUrl = null;
                }
            },
            error => console.error('Error loading template:', error)
        );
    }

    private loadLastChequeNumber(accountId: number) {
        this.chequeService.getLastCheque(accountId).subscribe(
            response => this.lastChequeNumber = response.lastCheque,
            error => console.error('Error loading last cheque number:', error)
        );
    }

    onSubmit() {
        if (this.chequeForm.valid) {
            const { accountId, chequeCount } = this.chequeForm.value;
            this.isGenerating = true;

            this.chequeService.generateCheques(accountId, chequeCount).subscribe(
                response => {
                    this.isGenerating = false;
                    // Add to history
                    this.generationHistory.unshift({
                        accountId,
                        startNumber: response.startNumber,
                        endNumber: response.endNumber,
                        generatedAt: new Date(),
                        pdfPath: response.pdfPath
                    });
                    // Update last cheque number by re-fetching
                    this.loadLastChequeNumber(accountId);
                },
                error => {
                    console.error('Error generating cheques:', error);
                    this.isGenerating = false;
                }
            );
        }
    }

    downloadPdf(pdfPath: string) {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = pdfPath;
        link.target = '_blank'; // Open in a new tab

        // Extract filename from path
        const filename = pdfPath.split('/').pop() || 'cheque.pdf';
        link.download = filename;

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    updateLastChequeNumber() {
        this.updateChequeNumberError = '';
        this.updateChequeNumberSuccess = '';
        const accountId = this.chequeForm.get('accountId')?.value;
        const newNumber = Number(this.updateChequeNumberValue);
        if (!accountId || newNumber == null || isNaN(newNumber) || newNumber < 0) {
            this.updateChequeNumberError = 'Please enter a valid cheque number.';
            return;
        }
        this.chequeService.updateLastCheque(accountId, newNumber).subscribe({
            next: (res: any) => {
                this.updateChequeNumberSuccess = 'Cheque number updated!';
                this.loadLastChequeNumber(accountId);
            },
            error: () => {
                this.updateChequeNumberError = 'Failed to update cheque number.';
            }
        });
    }

    logout() {
        localStorage.removeItem('isLoggedIn');
        this.router.navigate(['/']);
    }
} 