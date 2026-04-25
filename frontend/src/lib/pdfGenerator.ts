import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './utils';

interface Invoice {
    invoice_number: string;
    issue_date: string;
    due_date?: string;
    subtotal: number;
    tax_amount: number;
    discount: number;
    total: number;
    notes?: string;
    client_name: string;
    client_email?: string;
    client_address?: string;
    items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        total: number;
    }>;
}

interface CompanySettings {
    company_name?: string;
    company_address?: string;
    company_email?: string;
    company_logo_url?: string;
    footer_note?: string;
}

// Helper to load image as base64
const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            } else {
                reject(new Error("Canvas context is null"));
            }
        };
        img.onerror = (error) => {
            reject(error);
        };
        img.src = url;
    });
};

// PDF Safe currency formatter (no symbols that break jsPDF default fonts)
const formatCurrencyPDF = (amount: number | string) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(isNaN(value) ? 0 : value);
};

export const generateInvoicePDF = async (invoice: Invoice, settings?: CompanySettings, type: 'invoice' | 'quotation' = 'invoice') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- Colors ---
    // Violet 600: #7C3AED -> [124, 58, 237]
    const brandColor = [124, 58, 237] as [number, number, number];
    const darkColor = [30, 41, 59] as [number, number, number]; // Slate 800
    const lightColor = [248, 250, 252] as [number, number, number]; // Slate 50
    const grayColor = [100, 116, 139] as [number, number, number]; // Slate 500

    // --- Header ---

    // Logo (Top Left)
    let logoOffset = 0;

    // Try to load the system logo or settings logo
    try {
        const logoUrl = '/logo.png'; // Enforce the new logo as requested
        const logoData = await getBase64ImageFromURL(logoUrl);
        doc.addImage(logoData, 'PNG', 14, 10, 60, 20); // Wider for wordmark
        logoOffset = 30; // Flag that logo is present
    } catch (e) {
        // Fallback to settings logo if exists and valid data url
        if (settings?.company_logo_url && settings.company_logo_url.startsWith('data:image')) {
            try {
                doc.addImage(settings.company_logo_url, 'PNG', 14, 10, 20, 20);
                logoOffset = 25;
            } catch (err) {
                console.error("Failed to add fallback logo", err);
            }
        }
    }

    // Company Name (Next to Logo)
    // If logoOffset is set, it means we have a logo which contains the name.
    if (logoOffset === 0) {
        doc.setFontSize(18);
        doc.setTextColor(0);
        doc.text(settings?.company_name || "InvoiceOS", 14, 20);

        doc.setFontSize(9);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        const tagline = "Trustworthy and Reliable";
        doc.text(tagline, 14, 25);
    }


    // --- Header Services Graphic ---
    // Top Right Violet Shape
    doc.setFillColor(124, 58, 237); // Brand Main

    // Custom shape for top right
    const headerShapeX = pageWidth - 110;
    // Draw shape: (Start X, 0) -> TopRight -> RightDown -> BottomLeftish -> Start
    doc.lines(
        [
            [110, 0], // to Top-Right
            [0, 50],  // to Right-Down
            [-50, 10], // Curve/Line bottom-left
            [-60, -60] // Diag-Up-Left back to start y=0
        ],
        headerShapeX, 0, [1, 1], 'F', true
    );

    // Services Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");

    // Align text inside the shape
    const listX = pageWidth - 65;
    const listY = 15;
    const listGap = 6;

    doc.text("- Web Development", listX, listY);
    doc.text("- Digital Marketing", listX, listY + listGap);
    doc.text("- General IT Service", listX, listY + (listGap * 2));

    // Decorative Triangles in header
    doc.setFillColor(167, 139, 250); // Lighter violet
    // Triangle 1
    doc.triangle(pageWidth - 30, 45, pageWidth - 20, 40, pageWidth - 25, 52, 'F');
    // Triangle 2
    doc.triangle(pageWidth - 85, 10, pageWidth - 80, 5, pageWidth - 75, 15, 'F');

    // Reset Font
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);


    // --- Info Section (Bill To / Meta) ---
    // Two columns.
    const startY = 60;

    // Left: "Bill To"
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${type === 'quotation' ? 'Quote' : 'Invoice'} to:`, 14, startY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(invoice.client_name, 14, startY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);

    let addressY = startY + 11;
    if (invoice.client_address) {
        const splitAddress = doc.splitTextToSize(invoice.client_address, 80);
        doc.text(splitAddress, 14, addressY);
        addressY += (splitAddress.length * 5);
    }
    if (invoice.client_email) {
        doc.text(invoice.client_email, 14, addressY);
    }


    // Right: Invoice Meta
    // Adjusted coordinates to prevent overlap
    const metaLabelX = pageWidth - 70; // Labels start further left
    const metaValueX = pageWidth - 14; // Values align to right margin

    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    doc.text(`${type === 'quotation' ? 'Quote' : 'Invoice'}#`, metaLabelX, startY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(invoice.invoice_number, metaValueX, startY, { align: 'right' });

    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Date", metaLabelX, startY + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(invoice.issue_date, metaValueX, startY + 6, { align: 'right' });


    // --- Items Table ---
    const tableStartY = Math.max(addressY, startY + 20) + 10;

    const tableColumn = ["SL.", "Item Description", "Price", "Qty.", "Total"];
    const tableRows: (string | number)[][] = [];

    invoice.items.forEach((item, index) => {
        const row = [
            index + 1,
            item.description,
            formatCurrencyPDF(item.unit_price),
            item.quantity,
            formatCurrencyPDF(item.total)
        ];
        tableRows.push(row);
    });

    // @ts-ignore
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: tableStartY,
        theme: 'plain', // We will style manually
        styles: {
            fontSize: 9,
            cellPadding: 3,
            textColor: [50, 50, 50],
        },
        headStyles: {
            fillColor: darkColor,
            textColor: [255, 255, 255], // White
            fontStyle: 'bold',
            halign: 'left'
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' }, // SL
            1: { cellWidth: 'auto' }, // Desc
            2: { cellWidth: 30, halign: 'right' }, // Price
            3: { cellWidth: 20, halign: 'center' }, // Qty
            4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' } // Total
        },
        alternateRowStyles: {
            fillColor: lightColor
        },
        margin: { top: 20, bottom: 40 } // bottom margin for footer
    });

    // --- Totals Section ---
    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 10;

    // Check if we need a new page for totals
    if (finalY > pageHeight - 60) {
        doc.addPage();
        finalY = 20;
    }

    const totalsX = pageWidth - 80; // Start of totals block
    const totalsWidth = 66; // Width of totals block area (margins)

    // Subtotal
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Sub Total:", totalsX, finalY);
    doc.text(formatCurrencyPDF(invoice.subtotal), pageWidth - 14, finalY, { align: 'right' });

    // Tax (if applicable)
    if (invoice.tax_amount > 0) {
        finalY += 6;
        doc.text("Tax:", totalsX, finalY);
        doc.text(formatCurrencyPDF(invoice.tax_amount), pageWidth - 14, finalY, { align: 'right' });
    }
    // Discount (if applicable)
    if (invoice.discount > 0) {
        finalY += 6;
        doc.text("Discount:", totalsX, finalY);
        doc.text(`-${formatCurrencyPDF(invoice.discount)}`, pageWidth - 14, finalY, { align: 'right' });
    }

    // Grand Total Block
    finalY += 8;
    const totalBlockHeight = 10;

    // Colored Block
    doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]); // Brand layout
    doc.rect(totalsX - 2, finalY - 6, totalsWidth + 2, totalBlockHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Total:", totalsX + 2, finalY);
    doc.text(`NGN ${formatCurrencyPDF(invoice.total)}`, pageWidth - 14, finalY, { align: 'right' });




    // --- Footer Section ---
    const footerHeight = 50;
    const footerY = pageHeight - footerHeight;

    // "Thank you" message (Centered relative to content or page)
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    const thankYouMsg = "Thank you for your trust. We look forward to delivering an excellent solution that reflects your mission with excellence and innovation.";
    const thankYouWidth = doc.getTextWidth(thankYouMsg);
    doc.text(thankYouMsg, (pageWidth - thankYouWidth) / 2, footerY - 10);

    // --- Footer Graphic & Contact Info ---

    // Left: Violet Blob Graphic (Fluid Organic Shape)
    doc.setFillColor(167, 139, 250); // Violet-400
    doc.setDrawColor(167, 139, 250);
    doc.setLineWidth(0.1);

    // Draw fluid shape path
    doc.lines(
        [
            [0, -15],
            [40, -10, 70, 10, 110, 0],
            [30, 10, 50, 40, 40, 60],
            [-160, 0]
        ],
        0,
        pageHeight,
        [1, 1],
        'F',
        false
    );

    // Decorative Triangles
    doc.setFillColor(124, 58, 237); // Darker violet
    doc.triangle(15, footerY + 15, 23, footerY + 22, 13, footerY + 26, 'F');
    doc.triangle(80, footerY + 30, 92, footerY + 22, 88, footerY + 42, 'F');
    doc.triangle(40, footerY + 42, 44, footerY + 45, 37, footerY + 45, 'F');


    // Right: Contact Info
    // Shifted left to ensure fit
    const infoXStart = pageWidth * 0.45;

    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const lineHeight = 7;
    let currentLineY = footerY + 12;

    // Helper to draw clean vector-like icons
    const drawCustomIcon = (type: 'pin' | 'mail' | 'phone' | 'fb' | 'x' | 'insta', x: number, y: number) => {
        const r = 2.5; // container radius
        doc.setFillColor(124, 58, 237); // Brand Violet
        // Background Circle for consistency
        doc.circle(x, y - 1, r, 'F');

        doc.setFillColor(255, 255, 255); // White icons

        if (type === 'pin') {
            // Map Pin Shape: Circle head + Triangle body pointing down
            // Head
            doc.circle(x, y - 2, 1.2, 'F');
            // Body (Triangle) - Manually drawing a small path
            doc.triangle(x - 1.2, y - 2, x + 1.2, y - 2, x, y + 0.5, 'F');
            // Center hole
            doc.setFillColor(124, 58, 237);
            doc.circle(x, y - 2, 0.4, 'F');
            doc.setFillColor(255, 255, 255);
        } else if (type === 'mail') {
            // Envelope: Rect + Triangle flap
            const w = 3; const h = 2;
            const ex = x - 1.5; const ey = y - 2;
            doc.rect(ex, ey, w, h, 'F');
            // Flap cutout (Inverse triangle effect by drawing violet or just white lines?)
            // Easier: Draw white rect, then draw violet lines for flap
            doc.setDrawColor(124, 58, 237);
            doc.setLineWidth(0.2);
            doc.line(ex, ey, ex + w / 2, ey + h / 1.5);
            doc.line(ex + w, ey, ex + w / 2, ey + h / 1.5);
            // Reset
            doc.setDrawColor(167, 139, 250);
        } else if (type === 'phone') {
            // Handset: Diagonal rounded rects or composite
            // Simple robust representation: Rotated rect is hard in easy-mode jsPDF
            // Use standard rect but stylize
            doc.rect(x - 0.8, y - 2.2, 1.6, 2.4, 'F');
            // Screen
            doc.setFillColor(124, 58, 237);
            doc.rect(x - 0.6, y - 2, 1.2, 1.5, 'F');
            // Button
            doc.circle(x, y - 0.2, 0.2, 'F');
            doc.setFillColor(255, 255, 255);
        } else if (type === 'fb') {
            // Facebook 'f' - Shifted right bottom
            doc.setFontSize(8);
            doc.setFont("courier", "bold");
            doc.text("f", x - 0.5, y + 1.2);
        } else if (type === 'x') {
            // X Logo: Two crossed bars with thickness
            doc.setLineWidth(0.4);
            doc.setDrawColor(255, 255, 255);
            doc.line(x - 1, y - 2, x + 1, y);
            doc.line(x + 1, y - 2, x - 1, y);
            // Reset
            doc.setDrawColor(167, 139, 250);
        } else if (type === 'insta') {
            // Instagram Camera: Rounded rect + Circle + Dot
            const size = 3;
            const ix = x - 1.5; const iy = y - 2.5;
            // Main box (Stroke Only for standard Insta look? Filled white is clearer on violet)
            // Filled white rounded rect
            doc.roundedRect(ix, iy, size, size, 0.8, 0.8, 'F');
            // Inner violet circle
            doc.setFillColor(124, 58, 237);
            doc.circle(x, y - 1, 0.8, 'F'); // Lens
            // Inner white pupil
            doc.setFillColor(255, 255, 255);
            doc.circle(x, y - 1, 0.3, 'F');
            // Flash dot
            doc.setFillColor(124, 58, 237);
            doc.circle(x + 1, y - 2, 0.2, 'F');
            doc.setFillColor(255, 255, 255);
        }
    };

    // 1. Address
    drawCustomIcon('pin', infoXStart, currentLineY);
    doc.setTextColor(30, 41, 59);
    doc.text("Plot 9 Oloko Crescent, GRA Ikeja, Lagos Nigeria.", infoXStart + 8, currentLineY);

    // 2. Email
    currentLineY += lineHeight;
    drawCustomIcon('mail', infoXStart, currentLineY);
    doc.text("support@invoiceos.com", infoXStart + 8, currentLineY);

    // 3. Phone
    currentLineY += lineHeight;
    drawCustomIcon('phone', infoXStart, currentLineY);
    doc.text("+2348177148582, 09064553134", infoXStart + 8, currentLineY);

    // Socials Row
    const phoneTextWidth = doc.getTextWidth("+2348177148582, 09064553134");
    let socialX = infoXStart + 8 + phoneTextWidth + 8;

    // FB
    drawCustomIcon('fb', socialX, currentLineY);

    // X / Twitter
    socialX += 7;
    drawCustomIcon('x', socialX, currentLineY);

    // Insta
    socialX += 7;
    drawCustomIcon('insta', socialX, currentLineY);

    // InvoiceOS.AI text
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("InvoiceOS.AI", socialX + 8, currentLineY);

    // Save
    doc.save(`${type}_${invoice.invoice_number}.pdf`);
};
