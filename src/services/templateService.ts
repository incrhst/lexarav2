import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

export class TemplateService {
  private static async loadTemplate(templateName: string): Promise<ArrayBuffer> {
    const response = await fetch(`/src/assets/templates/${templateName}`);
    return await response.arrayBuffer();
  }

  static async generateCertificate(
    templateName: string,
    data: {
      certificateNumber: string;
      registrationNumber: string;
      applicantName: string;
      markDetails: {
        title: string;
        type: string;
        classes: Array<{ number: number; description: string }>;
      };
      registrationDate: string;
      renewalDate: string;
      issuedDate: string;
      qrCode: string;
      digitalSignature: string;
    }
  ): Promise<Blob> {
    try {
      // Load the template
      const content = await this.loadTemplate(templateName);
      const zip = new PizZip(content);
      
      // Create the template processor
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Render the document with the provided data
      doc.render(data);

      // Generate output
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      return out;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw new Error('Failed to generate certificate');
    }
  }

  static async downloadCertificate(
    templateName: string,
    data: any,
    filename: string
  ): Promise<void> {
    try {
      const blob = await this.generateCertificate(templateName, data);
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw new Error('Failed to download certificate');
    }
  }
} 