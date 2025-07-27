import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// @ts-ignore
import Papa from 'papaparse';
import * as xmlbuilder from 'xmlbuilder';

// Type declarations for external libraries
// Remove invalid module augmentation for jspdf-autotable

export interface PaymentExportData {
  id: string;
  customer: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  type: string;
  transactionId?: string;
  is_stripe?: boolean;
  vehicle_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'json' | 'xml' | 'html' | 'text';

// Helper function to format data consistently across all formats
const formatPaymentData = (payment: PaymentExportData) => ({
  'Payment ID': payment.id,
  'Customer': payment.customer,
  'Description': payment.description,
  'Amount': `$${payment.amount.toFixed(2)}`,
  'Date': new Date(payment.date).toLocaleDateString(),
  'Status': payment.status,
  'Type': payment.type,
  'Transaction ID': payment.transactionId || 'N/A',
  'Payment Method': payment.is_stripe ? 'Stripe' : 'Manual',
  'Vehicle ID': payment.vehicle_id || 'N/A',
  'Created At': payment.created_at ? new Date(payment.created_at).toLocaleString() : 'N/A',
  'Updated At': payment.updated_at ? new Date(payment.updated_at).toLocaleString() : 'N/A'
});

// Helper function to create and download a file
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToExcel = (payments: PaymentExportData[], filename: string = 'payments') => {
  try {
    const excelData = payments.map(formatPaymentData);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Payment ID
      { wch: 20 }, // Customer
      { wch: 30 }, // Description
      { wch: 12 }, // Amount
      { wch: 15 }, // Date
      { wch: 12 }, // Status
      { wch: 15 }, // Type
      { wch: 20 }, // Transaction ID
      { wch: 15 }, // Payment Method
      { wch: 15 }, // Vehicle ID
      { wch: 20 }, // Created At
      { wch: 20 }  // Updated At
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');

    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, finalFilename);

    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, error: 'Failed to export to Excel' };
  }
};

export const exportToPDF = (payments: PaymentExportData[], filename: string = 'payments') => {
  try {
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Add title
    doc.setFontSize(20);
    doc.text('Payment Report', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Payments: ${payments.length}`, 14, 40);

    // Prepare data for PDF table
    const tableData = payments.map(payment => [
      payment.id,
      payment.customer,
      payment.description,
      `$${payment.amount.toFixed(2)}`,
      new Date(payment.date).toLocaleDateString(),
      payment.status,
      payment.type,
      payment.is_stripe ? 'Stripe' : 'Manual'
    ]);

    // Add table to PDF
    autoTable(doc, {
      head: [['ID', 'Customer', 'Description', 'Amount', 'Date', 'Status', 'Type', 'Method']],
      body: tableData,
      startY: 50,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Light gray
      },
      columnStyles: {
        0: { cellWidth: 20 }, // ID
        1: { cellWidth: 30 }, // Customer
        2: { cellWidth: 40 }, // Description
        3: { cellWidth: 20 }, // Amount
        4: { cellWidth: 25 }, // Date
        5: { cellWidth: 20 }, // Status
        6: { cellWidth: 25 }, // Type
        7: { cellWidth: 20 }  // Method
      }
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}_${timestamp}.pdf`;

    doc.save(finalFilename);

    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return { success: false, error: 'Failed to export to PDF' };
  }
};

export const exportToCSV = (payments: PaymentExportData[], filename: string = 'payments') => {
  try {
    const csvData = payments.map(formatPaymentData);
    const csv = Papa.unparse(csvData);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}_${timestamp}.csv`;
    
    downloadFile(csv, finalFilename, 'text/csv;charset=utf-8;');

    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return { success: false, error: 'Failed to export to CSV' };
  }
};

export const exportToJSON = (payments: PaymentExportData[], filename: string = 'payments') => {
  try {
    const jsonData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalPayments: payments.length,
        exportFormat: 'JSON'
      },
      payments: payments.map(payment => ({
        ...payment,
        amount: parseFloat(payment.amount.toFixed(2)),
        date: new Date(payment.date).toISOString(),
        created_at: payment.created_at ? new Date(payment.created_at).toISOString() : null,
        updated_at: payment.updated_at ? new Date(payment.updated_at).toISOString() : null
      }))
    };
    
    const json = JSON.stringify(jsonData, null, 2);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}_${timestamp}.json`;
    
    downloadFile(json, finalFilename, 'application/json');

    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    return { success: false, error: 'Failed to export to JSON' };
  }
};

export const exportToXML = (payments: PaymentExportData[], filename: string = 'payments') => {
  try {
    const xmlDoc = xmlbuilder.create('payments')
      .att('generatedAt', new Date().toISOString())
      .att('totalCount', payments.length.toString());

    payments.forEach(payment => {
      xmlDoc.ele('payment')
        .ele('id', payment.id).up()
        .ele('customer', payment.customer).up()
        .ele('description', payment.description).up()
        .ele('amount', payment.amount.toFixed(2)).up()
        .ele('date', new Date(payment.date).toISOString()).up()
        .ele('status', payment.status).up()
        .ele('type', payment.type).up()
        .ele('transactionId', payment.transactionId || '').up()
        .ele('paymentMethod', payment.is_stripe ? 'Stripe' : 'Manual').up()
        .ele('vehicleId', payment.vehicle_id || '').up()
        .ele('createdAt', payment.created_at || '').up()
        .ele('updatedAt', payment.updated_at || '');
    });

    const xml = xmlDoc.end({ pretty: true });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}_${timestamp}.xml`;
    
    downloadFile(xml, finalFilename, 'application/xml');

    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error('Error exporting to XML:', error);
    return { success: false, error: 'Failed to export to XML' };
  }
};

export const exportToHTML = (payments: PaymentExportData[], filename: string = 'payments') => {
  try {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Report - ${filename}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1rem;
        }
        .stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 20px;
        }
        .stat {
            text-align: center;
        }
        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            display: block;
        }
        .stat-label {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        .table-container {
            padding: 30px;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }
        th {
            background-color: #f1f5f9;
            color: #1e293b;
            font-weight: 600;
            text-align: left;
            padding: 12px;
            border-bottom: 2px solid #e2e8f0;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        tr:hover {
            background-color: #f1f5f9;
        }
        .amount {
            font-weight: 600;
            color: #059669;
        }
        .status-completed {
            color: #059669;
            font-weight: 600;
        }
        .status-pending {
            color: #d97706;
            font-weight: 600;
        }
        .status-refunded {
            color: #dc2626;
            font-weight: 600;
        }
        .footer {
            background-color: #f1f5f9;
            padding: 20px 30px;
            text-align: center;
            color: #64748b;
            font-size: 0.9rem;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Report</h1>
            <p>Comprehensive payment transaction details</p>
            <div class="stats">
                <div class="stat">
                    <span class="stat-value">${payments.length}</span>
                    <span class="stat-label">Total Payments</span>
                </div>
                <div class="stat">
                    <span class="stat-value">$${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                    <span class="stat-label">Total Amount</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${new Date().toLocaleDateString()}</span>
                    <span class="stat-label">Generated Date</span>
                </div>
            </div>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Payment ID</th>
                        <th>Customer</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>Method</th>
                        <th>Transaction ID</th>
                    </tr>
                </thead>
                <tbody>
                    ${payments.map(payment => `
                        <tr>
                            <td>${payment.id}</td>
                            <td>${payment.customer}</td>
                            <td>${payment.description}</td>
                            <td class="amount">$${payment.amount.toFixed(2)}</td>
                            <td>${new Date(payment.date).toLocaleDateString()}</td>
                            <td class="status-${payment.status.toLowerCase()}">${payment.status}</td>
                            <td>${payment.type}</td>
                            <td>${payment.is_stripe ? 'Stripe' : 'Manual'}</td>
                            <td>${payment.transactionId || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | Saam Cars LLC Payment System</p>
        </div>
    </div>
</body>
</html>`;

    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}_${timestamp}.html`;
    
    downloadFile(html, finalFilename, 'text/html');

    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error('Error exporting to HTML:', error);
    return { success: false, error: 'Failed to export to HTML' };
  }
};

export const exportToText = (payments: PaymentExportData[], filename: string = 'payments') => {
  try {
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    
    let text = `PAYMENT REPORT
Generated: ${new Date().toLocaleString()}
Total Payments: ${payments.length}
Total Amount: $${totalAmount.toFixed(2)}

${'='.repeat(80)}

`;

    payments.forEach((payment, index) => {
      text += `Payment #${index + 1}
${'-'.repeat(40)}
ID: ${payment.id}
Customer: ${payment.customer}
Description: ${payment.description}
Amount: $${payment.amount.toFixed(2)}
Date: ${new Date(payment.date).toLocaleDateString()}
Status: ${payment.status}
Type: ${payment.type}
Method: ${payment.is_stripe ? 'Stripe' : 'Manual'}
Transaction ID: ${payment.transactionId || 'N/A'}
Vehicle ID: ${payment.vehicle_id || 'N/A'}
Created: ${payment.created_at ? new Date(payment.created_at).toLocaleString() : 'N/A'}
Updated: ${payment.updated_at ? new Date(payment.updated_at).toLocaleString() : 'N/A'}

`;
    });

    text += `${'='.repeat(80)}
Report End
Generated by Saam Cars LLC Payment System`;

    const timestamp = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename}_${timestamp}.txt`;
    
    downloadFile(text, finalFilename, 'text/plain');

    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error('Error exporting to Text:', error);
    return { success: false, error: 'Failed to export to Text' };
  }
};

// Main export function that handles all formats
export const exportPayments = (payments: PaymentExportData[], format: ExportFormat, filename: string = 'payments') => {
  switch (format) {
    case 'excel':
      return exportToExcel(payments, filename);
    case 'pdf':
      return exportToPDF(payments, filename);
    case 'csv':
      return exportToCSV(payments, filename);
    case 'json':
      return exportToJSON(payments, filename);
    case 'xml':
      return exportToXML(payments, filename);
    case 'html':
      return exportToHTML(payments, filename);
    case 'text':
      return exportToText(payments, filename);
    default:
      return { success: false, error: 'Unsupported export format' };
  }
};

export const getExportFilename = (type: ExportFormat, baseName: string = 'payments') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const extensions = {
    excel: 'xlsx',
    pdf: 'pdf',
    csv: 'csv',
    json: 'json',
    xml: 'xml',
    html: 'html',
    text: 'txt'
  };
  const extension = extensions[type];
  return `${baseName}_${timestamp}.${extension}`;
};

// Get format information for UI display
export const getFormatInfo = (format: ExportFormat) => {
  const formatInfo = {
    excel: {
      name: 'Excel (.xlsx)',
      description: 'Professional spreadsheet format',
      icon: '📊',
      useCase: 'Business reports, data analysis, sharing with stakeholders'
    },
    pdf: {
      name: 'PDF (.pdf)',
      description: 'Professional document format',
      icon: '📄',
      useCase: 'Official reports, printing, archiving'
    },
    csv: {
      name: 'CSV (.csv)',
      description: 'Simple data format',
      icon: '📋',
      useCase: 'Data analysis, database imports, simple spreadsheets'
    },
    json: {
      name: 'JSON (.json)',
      description: 'Structured data format',
      icon: '🔧',
      useCase: 'API integrations, data processing, developer use'
    },
    xml: {
      name: 'XML (.xml)',
      description: 'Enterprise data format',
      icon: '🏢',
      useCase: 'Enterprise systems, legacy integrations, data exchange'
    },
    html: {
      name: 'HTML (.html)',
      description: 'Web report format',
      icon: '🌐',
      useCase: 'Web reports, email sharing, online viewing'
    },
    text: {
      name: 'Text (.txt)',
      description: 'Simple text format',
      icon: '📝',
      useCase: 'Simple reports, logging, basic documentation'
    }
  };
  
  return formatInfo[format];
}; 