// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// // Angular Material Imports
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatListModule } from '@angular/material/list';
// import { MatIconModule } from '@angular/material/icon';

// import { ChequeService, Company, Bank, Account, ChequeTemplate } from '../../services/cheque.service';

// @Component({
//     selector: 'app-cheque-generator',
//     templateUrl: './cheque-generator.component.html',
//     styleUrls: ['./cheque-generator.component.scss'],
//     standalone: true,
//     imports: [
//         CommonModule,
//         ReactiveFormsModule,
//         HttpClientModule,
//         MatCardModule,
//         MatFormFieldModule,
//         MatInputModule,
//         MatSelectModule,
//         MatButtonModule,
//         MatProgressSpinnerModule,
//         MatListModule,
//         MatIconModule,
//         FormsModule
//     ]
// })
// export class ChequeGeneratorComponent implements OnInit {
//     chequeForm: FormGroup;
//     companies: Company[] = [];
//     banks: Bank[] = [];
//     accounts: Account[] = [];
//     selectedTemplate: ChequeTemplate | null = null;
//     lastChequeNumber: number = 0;
//     isGenerating: boolean = false;
//     generationHistory: any[] = [];
//     updateChequeNumberValue: number | null = null;
//     updateChequeNumberError: string = '';
//     updateChequeNumberSuccess: string = '';
//     safeTemplateUrl: SafeResourceUrl | null = null;

//     constructor(
//         private fb: FormBuilder,
//         private chequeService: ChequeService,
//         private router: Router,
//         private sanitizer: DomSanitizer
//     ) {
//         this.chequeForm = this.fb.group({
//             companyId: ['', Validators.required],
//             bankId: ['', Validators.required],
//             accountId: ['', Validators.required],
//             chequeCount: ['', [Validators.required, Validators.min(1)]]
//         });
//     }

//     ngOnInit() {
//         this.loadCompanies();
//         this.setupFormListeners();
//     }

//     private loadCompanies() {
//         this.chequeService.getCompanies().subscribe(
//             companies => this.companies = companies,
//             error => console.error('Error loading companies:', error)
//         );
//     }

//     private setupFormListeners() {
//         this.chequeForm.get('companyId')?.valueChanges.subscribe(companyId => {
//             if (companyId) {
//                 this.loadBanks(companyId);
//                 this.chequeForm.patchValue({ bankId: '', accountId: '' });
//             }
//         });

//         this.chequeForm.get('bankId')?.valueChanges.subscribe(bankId => {
//             if (bankId) {
//                 this.loadAccounts(bankId);
//                 this.loadTemplate(
//                     this.chequeForm.get('companyId')?.value,
//                     bankId
//                 );
//                 this.chequeForm.patchValue({ accountId: '' });
//             }
//         });

//         this.chequeForm.get('accountId')?.valueChanges.subscribe(accountId => {
//             if (accountId) {
//                 this.loadLastChequeNumber(accountId);
//             }
//         });
//     }

//     private loadBanks(companyId: number) {
//         this.chequeService.getBanks(companyId).subscribe(
//             banks => this.banks = banks,
//             error => console.error('Error loading banks:', error)
//         );
//     }

//     private loadAccounts(bankId: number) {
//         this.chequeService.getAccounts(bankId).subscribe(
//             accounts => this.accounts = accounts,
//             error => console.error('Error loading accounts:', error)
//         );
//     }

//     private loadTemplate(companyId: number, bankId: number) {
//         this.chequeService.getTemplate(companyId, bankId).subscribe(
//             template => {
//                 if (template) {
//                     this.selectedTemplate = { ...template, background: `http://90.0.0.6:3000/${template.background}` };
//                     if (this.selectedTemplate.background.endsWith('.pdf')) {
//                         this.safeTemplateUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.selectedTemplate.background);
//                     } else {
//                         this.safeTemplateUrl = null;
//                     }
//                 } else {
//                     this.selectedTemplate = null;
//                     this.safeTemplateUrl = null;
//                 }
//             },
//             error => console.error('Error loading template:', error)
//         );
//     }

//     private loadLastChequeNumber(accountId: number) {
//         this.chequeService.getLastCheque(accountId).subscribe(
//             response => this.lastChequeNumber = response.lastCheque,
//             error => console.error('Error loading last cheque number:', error)
//         );
//     }

//     onSubmit() {
//         if (this.chequeForm.valid) {
//             const { accountId, chequeCount } = this.chequeForm.value;
//             this.isGenerating = true;

//             this.chequeService.generateCheques(accountId, chequeCount).subscribe(
//                 response => {
//                     this.isGenerating = false;
//                     // Add to history
//                     this.generationHistory.unshift({
//                         accountId,
//                         startNumber: response.startNumber,
//                         endNumber: response.endNumber,
//                         generatedAt: new Date(),
//                         pdfPath: response.pdfPath
//                     });
//                     // Update last cheque number by re-fetching
//                     this.loadLastChequeNumber(accountId);
//                 },
//                 error => {
//                     console.error('Error generating cheques:', error);
//                     this.isGenerating = false;
//                 }
//             );
//         }
//     }

//     downloadPdf(pdfPath: string) {
//         // Create a temporary link element
//         const link = document.createElement('a');
//         link.href = pdfPath;
//         link.target = '_blank'; // Open in a new tab

//         // Extract filename from path
//         const filename = pdfPath.split('/').pop() || 'cheque.pdf';
//         link.download = filename;

//         // Append to body, click, and remove
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     }

//     updateLastChequeNumber() {
//         this.updateChequeNumberError = '';
//         this.updateChequeNumberSuccess = '';
//         const accountId = this.chequeForm.get('accountId')?.value;
//         const newNumber = Number(this.updateChequeNumberValue);
//         if (!accountId || newNumber == null || isNaN(newNumber) || newNumber < 0) {
//             this.updateChequeNumberError = 'Please enter a valid cheque number.';
//             return;
//         }
//         this.chequeService.updateLastCheque(accountId, newNumber).subscribe({
//             next: (res: any) => {
//                 this.updateChequeNumberSuccess = 'Cheque number updated!';
//                 this.loadLastChequeNumber(accountId);
//             },
//             error: () => {
//                 this.updateChequeNumberError = 'Failed to update cheque number.';
//             }
//         });
//     }

//     logout() {
//         localStorage.removeItem('isLoggedIn');
//         this.router.navigate(['/']);
//     }
// } 































// frontend/src/app/components/cheque-generator/cheque-generator.component.ts

// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';
// import { ChequeService, Company, Bank, Account } from '../../services/cheque.service';

// // Import all necessary Angular Material Modules
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatListModule } from '@angular/material/list';
// import { MatIconModule } from '@angular/material/icon';
// import { MatExpansionModule } from '@angular/material/expansion';

// @Component({
//     selector: 'app-cheque-generator',
//     templateUrl: './cheque-generator.component.html',
//     styleUrls: ['./cheque-generator.component.scss'],
//     standalone: true,
//     imports: [
//         CommonModule, ReactiveFormsModule, HttpClientModule, MatCardModule,
//         MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
//         MatProgressSpinnerModule, MatListModule, MatIconModule, MatExpansionModule
//     ]
// })
// export class ChequeGeneratorComponent implements OnInit, OnDestroy {
//     assignForm: FormGroup;
//     companies: Company[] = [];
//     banks: Bank[] = [];
//     accounts: Account[] = [];

//     pendingCheques: any[] = [];
//     selectedPendingChequeId: number | null = null;
//     pollingInterval: any;
//     isProcessing = false;
//     lastChequeNumber: number | null = null;
//     nextChequeNumber: number | null = null;

//     constructor(
//         private fb: FormBuilder,
//         private chequeService: ChequeService
//     ) {
//         this.assignForm = this.fb.group({
//             companyId: ['', Validators.required],
//             bankId: ['', Validators.required],
//             accountId: ['', Validators.required]
//         });
//     }

//     ngOnInit() {
//         this.loadCompanies();
//         this.fetchPendingCheques();
//         // Poll the backend every 10 seconds for new cheques
//         this.pollingInterval = setInterval(() => this.fetchPendingCheques(), 10000);
//         this.setupFormListeners();
//     }

//     ngOnDestroy() {
//         // Important: clear the interval when the component is destroyed to prevent memory leaks
//         if (this.pollingInterval) {
//             clearInterval(this.pollingInterval);
//         }
//     }

//     fetchPendingCheques() {
//         this.chequeService.getPendingCheques().subscribe(data => {
//             this.pendingCheques = data;
//         });
//     }

//     loadCompanies() {
//         this.chequeService.getCompanies().subscribe(companies => this.companies = companies);
//     }

//     setupFormListeners() {
//         this.assignForm.get('companyId')?.valueChanges.subscribe(companyId => {
//             this.assignForm.get('bankId')?.reset();
//             this.assignForm.get('accountId')?.reset();
//             this.banks = [];
//             this.accounts = [];
//             if (companyId) {
//                 this.chequeService.getBanks(companyId).subscribe(banks => this.banks = banks);
//             }
//         });

//         this.assignForm.get('bankId')?.valueChanges.subscribe(bankId => {
//             this.assignForm.get('accountId')?.reset();
//             this.accounts = [];
//             if (bankId) {
//                 this.chequeService.getAccounts(bankId).subscribe(accounts => this.accounts = accounts);
//             }
//         });
//          this.assignForm.get('accountId')?.valueChanges.subscribe(accountId => {
//           this.resetChequeNumbers();
//           if (accountId) {
//               this.chequeService.getLastCheque(accountId).subscribe(data => {
//                   this.lastChequeNumber = data.lastCheque;
//                   this.nextChequeNumber = data.lastCheque + 1;
//               });
//           }
//       });
//     }
//     resetChequeNumbers() {
//       this.lastChequeNumber = null;
//       this.nextChequeNumber = null;
//   }

//     // When a user clicks on a pending cheque, we select it for processing
//     selectForProcessing(chequeId: number) {
//         this.selectedPendingChequeId = chequeId;
//         this.assignForm.reset(); // Reset the form for the new selection
//     }

//     onSubmit() {
//         if (this.assignForm.invalid || this.selectedPendingChequeId === null) {
//             alert('Please select a pending cheque and fill out all account fields.');
//             return;
//         }

//         this.isProcessing = true;
//         const { accountId } = this.assignForm.value;

//         this.chequeService.processPendingCheque(this.selectedPendingChequeId, accountId)
//           .subscribe({
//             next: (response) => {
//               this.isProcessing = false;
//               alert(`Success! Cheque has been processed and saved at: ${response.path}`);
//               this.fetchPendingCheques(); // Refresh list to remove the processed item
//               this.selectedPendingChequeId = null; // Deselect the cheque
//               this.assignForm.reset();
//             },
//             error: (err) => {
//               this.isProcessing = false;
//               alert(`Error: ${err.error?.message || 'Failed to process cheque.'}`);
//               console.error(err);
//             }
//           });
//     }
// }















import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChequeService, Company, Bank, Account } from '../../services/cheque.service';

// Import all necessary Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion'; // <-- Import Expansion Module

@Component({
  selector: 'app-cheque-generator',
  templateUrl: './cheque-generator.component.html',
  styleUrls: ['./cheque-generator.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, HttpClientModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatProgressSpinnerModule, MatListModule, MatIconModule, MatExpansionModule // <-- Add Expansion Module here
  ]
})
export class ChequeGeneratorComponent implements OnInit, OnDestroy {
  assignForm: FormGroup;
  updateChequeForm: FormGroup; 
  companies: Company[] = [];
  banks: Bank[] = [];
  accounts: Account[] = [];

  pendingCheques: any[] = [];
  selectedPendingChequeId: number | null = null;
  pollingInterval: any;
  isProcessing = false;

  lastChequeNumber: number | null = null;
  nextChequeNumber: number | null = null;
  lastGeneratedCheque: { url: string; fileName: string } | null = null;


  constructor(
      private fb: FormBuilder,
      private chequeService: ChequeService
  ) {
      this.assignForm = this.fb.group({
          companyId: ['', Validators.required],
          bankId: ['', Validators.required],
          accountId: ['', Validators.required]
      });
      this.updateChequeForm = this.fb.group({
        newLastCheck: [null, [Validators.required, Validators.min(0)]]
      });
  }

  ngOnInit() {
      this.loadCompanies();
      this.fetchPendingCheques();
      this.pollingInterval = setInterval(() => this.fetchPendingCheques(), 10000);
      this.setupFormListeners();
  }

  ngOnDestroy() {
      if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  fetchPendingCheques(): void {
  this.chequeService.getPendingCheques().subscribe(newCheques => {
    // Create a simple representation of the current and new lists for comparison.
    const currentIds = this.pendingCheques.map(c => c.id).sort().join(',');
    const newIds = newCheques.map(c => c.id).sort().join(',');

    // ONLY update the UI if the list has actually changed.
    // This prevents the UI from resetting while the user is working.
    if (currentIds !== newIds) {
      console.log('New pending cheques detected, updating list...');
      this.pendingCheques = newCheques;
    }
  });
}
  loadCompanies() {
    this.chequeService.getCompanies().subscribe(companies => this.companies = companies);
  }

  setupFormListeners() {
      this.assignForm.get('companyId')?.valueChanges.subscribe(companyId => {
          this.assignForm.get('bankId')?.reset();
          this.banks = [];
          if (companyId) {
              this.chequeService.getBanks(companyId).subscribe(banks => this.banks = banks);
          }
      });

      this.assignForm.get('bankId')?.valueChanges.subscribe(bankId => {
          this.assignForm.get('accountId')?.reset();
          this.accounts = [];
          if (bankId) {
              this.chequeService.getAccounts(bankId).subscribe(accounts => this.accounts = accounts);
          }
      });

      this.assignForm.get('accountId')?.valueChanges.subscribe(accountId => {
          this.lastChequeNumber = null;
          this.nextChequeNumber = null;
          if (accountId) {
              this.chequeService.getLastCheque(accountId).subscribe(data => {
                  this.lastChequeNumber = data.lastCheque;
                  this.nextChequeNumber = data.lastCheque + 1;
                  this.updateChequeForm.get('newLastCheck')?.setValue(data.lastCheque);
              });
          }
      });
  }

  // Called when an expansion panel is opened
  selectForProcessing(chequeId: number) {
      this.selectedPendingChequeId = chequeId;
      this.assignForm.reset(); // Reset form for the new selection
  }

  // Called when an expansion panel is closed
  deselectCheque() {
    if (!this.isProcessing) { // Don't deselect if we are in the middle of processing
      this.selectedPendingChequeId = null;
      this.assignForm.reset();
    }
  }
  
 resetChequeNumbers() {
    this.lastChequeNumber = null;
    this.nextChequeNumber = null;
    this.updateChequeForm.reset(); // Also reset the new form
  }
  onUpdateChequeNumber() {
    if (this.updateChequeForm.invalid) { return; }

    const accountId = this.assignForm.get('accountId')?.value;
    if (!accountId) {
      alert('Please select an account first.');
      return;
    }

    const newLastCheck = this.updateChequeForm.get('newLastCheck')?.value;

    if(confirm(`Are you sure you want to set the last printed cheque number to ${newLastCheck}?`)) {
      this.chequeService.updateLastCheque(accountId, newLastCheck).subscribe({
        next: (updatedAccount) => {
          alert('Successfully updated the cheque number.');
          // Refresh the displayed numbers
          this.lastChequeNumber = updatedAccount.lastCheck;
          this.nextChequeNumber = updatedAccount.lastCheck + 1;
        },
        error: (err) => {
          alert('Failed to update cheque number.');
          console.error(err);
        }
      });
    }
  }
  onSubmit() {
      if (this.assignForm.invalid || this.selectedPendingChequeId === null) {
          return;
      }

      this.isProcessing = true;
      const { accountId } = this.assignForm.value;

      this.chequeService.processPendingCheque(this.selectedPendingChequeId, accountId)
        .subscribe({
          next: (response) => {
            alert(`Success! Cheque #${this.nextChequeNumber} processed.`);
             // --- 2. CAPTURE THE RESPONSE AND SET THE LINK ---
            // The backend response has a 'path' property, e.g., "output\\FINAL_MERGED_CHEQUE_1121.pdf"
            const serverFilePath = response.path;
            // We need to get just the filename and construct a valid URL
            const fileName = serverFilePath.split('\\').pop().split('/').pop();
            this.lastGeneratedCheque = {
              // The URL the browser will use
              url: `http://localhost:3000/output/${fileName}`,
              // The filename to display
              fileName: fileName
            };
            //end of new logic
            this.isProcessing = false;
            this.selectedPendingChequeId = null; // This will close the panel
            this.fetchPendingCheques(); // Refresh the list
          },
          error: (err) => {
            this.isProcessing = false;
            alert(`Error: ${err.error?.message || 'Failed to process cheque.'}`);
            console.error(err);
          }
        });
  }
}