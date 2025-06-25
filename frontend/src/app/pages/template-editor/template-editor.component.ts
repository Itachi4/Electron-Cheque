import { Component, AfterViewInit } from '@angular/core';
import * as fabric from 'fabric'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-template-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './template-editor.component.html',
  styleUrls: ['./template-editor.component.scss']
})
export class TemplateEditorComponent implements AfterViewInit {
  canvas: fabric.Canvas | null = null;
  companyId = 1;
  bankId = 1;
  background = '/assets/template-blank.jpg'; // relative path to your cheque image
  fieldMap: any = {};

  constructor(private http: HttpClient) { }

  ngAfterViewInit() {
    this.canvas = new fabric.Canvas('cheque-canvas', {
      width: 800,
      height: 300,
      selection: false,
    });

    // Load cheque background image
    fabric.Image.fromURL(this.background, {
      crossOrigin: 'anonymous'
    }, (img: fabric.Image) => {
      if (!this.canvas) return;

      img.scaleToWidth(this.canvas.getWidth());
      img.scaleToHeight(this.canvas.getHeight());

      // Assign the background image directly (safer for Fabric v5+)
      this.canvas.backgroundImage = img;
      this.canvas.renderAll();
    });

    // Add draggable text fields
    ['payee', 'amount', 'memo', 'chequeNumber', 'micr'].forEach((field, index) => {
      const text = new fabric.Text(field, {
        left: 100 + index * 50,
        top: 100 + index * 20,
        fill: 'black',
        fontSize: 14,
        selectable: true,
      });

      (text as any).fieldName = field; // Store the field name
      this.canvas?.add(text);
    });
  }

  savePositions() {
    const map: Record<string, { x: number; y: number; fontSize?: number }> = {};

    this.canvas?.getObjects().forEach((obj) => {
      const field = (obj as any).fieldName;
      if (field) {
        map[field] = {
          x: obj.left ?? 0,
          y: obj.top ?? 0,
          fontSize: (obj as fabric.Text).fontSize ?? 14,
        };
      }
    });

    this.http.post('http://localhost:3000/api/templates', {
      name: 'Default',
      companyId: this.companyId,
      bankId: this.bankId,
      background: this.background,
      fieldMap: map,
    }).subscribe({
      next: () => alert('Template saved!'),
      error: (err) => alert('Failed to save template: ' + JSON.stringify(err)),
    });
  }
}
