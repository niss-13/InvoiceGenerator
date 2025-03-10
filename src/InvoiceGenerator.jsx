import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './InvoiceGenerator.css';

const InvoiceGenerator = () => {
  // State for form data
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    companyDetails: {
      name: '',
      address: '',
      email: '',
      phone: '',
      logo: null
    },
    clientDetails: {
      name: '',
      address: '',
      email: '',
      phone: ''
    },
    items: [
      {
        id: 1,
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        tax: 0
      }
    ],
    subtotal: 0,
    taxTotal: 0,
    discountPercentage: 0,
    discountAmount: 0,
    total: 0,
    notes: '',
    terms: '',
    paymentMethod: '',
    currency: 'USD'
  });

  // Handle company logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInvoiceData({
          ...invoiceData,
          companyDetails: {
            ...invoiceData.companyDetails,
            logo: e.target.result
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input changes
  const handleInputChange = (e, section, field) => {
    const { value } = e.target;
    
    if (section) {
      setInvoiceData({
        ...invoiceData,
        [section]: {
          ...invoiceData[section],
          [field]: value
        }
      });
    } else {
      setInvoiceData({
        ...invoiceData,
        [field]: value
      });
    }
  };

  // Handle item input changes
  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;
    
    // Calculate amount for the item
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(newItems[index].quantity) || 0;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(newItems[index].unitPrice) || 0;
      newItems[index].amount = quantity * unitPrice;
    }

    setInvoiceData({
      ...invoiceData,
      items: newItems
    });
  };

  // Add new item row
  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        {
          id: invoiceData.items.length + 1,
          description: '',
          quantity: 1,
          unitPrice: 0,
          amount: 0,
          tax: 0
        }
      ]
    });
  };

  // Remove item row
  const removeItem = (index) => {
    if (invoiceData.items.length > 1) {
      const newItems = invoiceData.items.filter((_, i) => i !== index);
      setInvoiceData({
        ...invoiceData,
        items: newItems
      });
    }
  };

  // Calculate invoice totals whenever items change
  useEffect(() => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxTotal = invoiceData.items.reduce((sum, item) => sum + ((item.amount || 0) * (item.tax || 0) / 100), 0);
    const discountAmount = (subtotal * (invoiceData.discountPercentage || 0)) / 100;
    const total = subtotal + taxTotal - discountAmount;

    setInvoiceData({
      ...invoiceData,
      subtotal,
      taxTotal,
      discountAmount,
      total
    });
  }, [invoiceData.items, invoiceData.discountPercentage]);

  // Generate and send invoice to backend
  const generateInvoice = async () => {
    try {
      // Placeholder for API call to Spring Boot backend
      console.log('Sending invoice data to backend:', invoiceData);
      
      // Example API call (uncomment and modify when backend is ready)
      /*
      const response = await fetch('http://localhost:8080/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Invoice generated successfully! Invoice ID: ' + data.id);
      } else {
        alert('Failed to generate invoice');
      }
      */
      
      alert('Invoice generated! (Backend integration pending)');
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoiceData.currency
    }).format(amount);
  };

  // Get currency symbol for PDF
  const getCurrencySymbol = () => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoiceData.currency,
    });
    return formatter.format(0).replace(/\d/g, '').replace(/\s/g, '').replace(/\./g, '');
  };

  // Function to generate PDF
  const generatePDF = () => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Define document margins and positions
    const margin = 15;
    let yPos = margin;
    const pageWidth = doc.internal.pageSize.width;
    
    // Add company logo if available
    if (invoiceData.companyDetails.logo) {
      try {
        doc.addImage(invoiceData.companyDetails.logo, 'JPEG', margin, yPos, 40, 20);
        yPos += 25;
      } catch (error) {
        console.error("Error adding logo to PDF:", error);
      }
    } else {
      yPos += 10;
    }
    
    // Set font for headers
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("INVOICE", pageWidth - margin - 50, 20);
    
    // Add invoice details in the top right
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, pageWidth - margin - 50, 30);
    doc.text(`Date: ${invoiceData.invoiceDate}`, pageWidth - margin - 50, 35);
    doc.text(`Due Date: ${invoiceData.dueDate}`, pageWidth - margin - 50, 40);
    
    // Reset yPos for company details
    yPos = margin + 30;
    
    // Company details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("From:", margin, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    yPos += 5;
    if (invoiceData.companyDetails.name) {
      doc.text(invoiceData.companyDetails.name, margin, yPos);
      yPos += 5;
    }
    
    // Handle multiline address by splitting
    if (invoiceData.companyDetails.address) {
      const addressLines = invoiceData.companyDetails.address.split('\n');
      addressLines.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 5;
      });
    }
    
    if (invoiceData.companyDetails.email) {
      doc.text(`Email: ${invoiceData.companyDetails.email}`, margin, yPos);
      yPos += 5;
    }
    
    if (invoiceData.companyDetails.phone) {
      doc.text(`Phone: ${invoiceData.companyDetails.phone}`, margin, yPos);
      yPos += 5;
    }
    
    // Client details
    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Bill To:", margin, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    yPos += 5;
    if (invoiceData.clientDetails.name) {
      doc.text(invoiceData.clientDetails.name, margin, yPos);
      yPos += 5;
    }
    
    // Handle multiline address
    if (invoiceData.clientDetails.address) {
      const addressLines = invoiceData.clientDetails.address.split('\n');
      addressLines.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 5;
      });
    }
    
    if (invoiceData.clientDetails.email) {
      doc.text(`Email: ${invoiceData.clientDetails.email}`, margin, yPos);
      yPos += 5;
    }
    
    if (invoiceData.clientDetails.phone) {
      doc.text(`Phone: ${invoiceData.clientDetails.phone}`, margin, yPos);
      yPos += 10;
    }
    
    // Currency symbol for amounts
    const currencySymbol = getCurrencySymbol();
    
    // Create items table
    const tableColumns = [
      { title: "Description", dataKey: "description" },
      { title: "Qty", dataKey: "quantity" },
      { title: `Unit Price (${currencySymbol})`, dataKey: "unitPrice" },
      { title: "Tax (%)", dataKey: "tax" },
      { title: `Amount (${currencySymbol})`, dataKey: "amount" }
    ];
    
    const tableRows = invoiceData.items.map(item => ({
      description: item.description,
      quantity: item.quantity.toString(),
      unitPrice: parseFloat(item.unitPrice).toFixed(2),
      tax: item.tax.toString(),
      amount: parseFloat(item.amount).toFixed(2)
    }));
    
    // Add items table
    doc.autoTable({
      startY: yPos,
      head: [tableColumns.map(col => col.title)],
      body: tableRows.map(row => tableColumns.map(col => row[col.dataKey])),
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66], textColor: 255 },
      margin: { top: yPos, left: margin, right: margin }
    });

    // Add these data attributes to item cells in the items-table section
// Find the items.map section and update it to include data-label attributes

{invoiceData.items.map((item, index) => (
    <div className="item-row" key={item.id}>
      <div className="item-cell description-cell" data-label="Description">
        <input
          type="text"
          placeholder="Item description"
          value={item.description}
          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
        />
      </div>
      <div className="item-cell quantity-cell" data-label="Quantity">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
        />
      </div>
      <div className="item-cell price-cell" data-label="Unit Price">
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.unitPrice}
          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
        />
      </div>
      <div className="item-cell tax-cell" data-label="Tax (%)">
        <input
          type="number"
          min="0"
          max="100"
          value={item.tax}
          onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
        />
      </div>
      <div className="item-cell amount-cell" data-label="Amount">
        {formatCurrency(item.amount)}
      </div>
      <div className="item-cell action-cell">
        <button className="btn small" onClick={() => removeItem(index)}>
          Remove
        </button>
      </div>
    </div>
  ))}
  
  // Update the Add Item button (remove the + text prefix since we're using CSS for that)
  <>
          // Update the Add Item button (remove the + text prefix since we're using CSS for that)
          <div className="add-item-row">
              <button className="btn add-item" onClick={addItem}>Add Item</button>
          </div>
          // Update the upload placeholder with emoji icon
          <div className="upload-placeholder">
              <label htmlFor="logo-upload">Upload Logo</label>
              <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }} />
          </div></>
    
    // Get final Y position after table
    yPos = doc.lastAutoTable.finalY + 10;
    
    // Add summary section
    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal:`, pageWidth - 80, yPos);
    doc.text(`${currencySymbol}${invoiceData.subtotal.toFixed(2)}`, pageWidth - margin - 10, yPos, { align: 'right' });
    yPos += 5;
    
    doc.text(`Tax:`, pageWidth - 80, yPos);
    doc.text(`${currencySymbol}${invoiceData.taxTotal.toFixed(2)}`, pageWidth - margin - 10, yPos, { align: 'right' });
    yPos += 5;
    
    if (invoiceData.discountPercentage > 0) {
      doc.text(`Discount (${invoiceData.discountPercentage}%):`, pageWidth - 80, yPos);
      doc.text(`${currencySymbol}${invoiceData.discountAmount.toFixed(2)}`, pageWidth - margin - 10, yPos, { align: 'right' });
      yPos += 5;
    }
    
    // Total
    doc.setFont("helvetica", "bold");
    doc.text(`Total:`, pageWidth - 80, yPos);
    doc.text(`${currencySymbol}${invoiceData.total.toFixed(2)}`, pageWidth - margin - 10, yPos, { align: 'right' });
    yPos += 15;
    
    // Payment method
    if (invoiceData.paymentMethod) {
      doc.setFont("helvetica", "bold");
      doc.text("Payment Method:", margin, yPos);
      doc.setFont("helvetica", "normal");
      let paymentMethodText = invoiceData.paymentMethod;
      
      // Format payment method text
      switch(invoiceData.paymentMethod) {
        case 'bank_transfer': paymentMethodText = "Bank Transfer"; break;
        case 'credit_card': paymentMethodText = "Credit Card"; break;
        case 'paypal': paymentMethodText = "PayPal"; break;
        case 'cash': paymentMethodText = "Cash"; break;
        case 'cheque': paymentMethodText = "Cheque"; break;
        default: paymentMethodText = invoiceData.paymentMethod;
      }
      
      doc.text(paymentMethodText, margin + 40, yPos);
      yPos += 10;
    }
    
    // Notes section
    if (invoiceData.notes) {
      doc.setFont("helvetica", "bold");
      doc.text("Notes:", margin, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 5;
      
      const splitNotes = doc.splitTextToSize(invoiceData.notes, pageWidth - (2 * margin));
      doc.text(splitNotes, margin, yPos);
      yPos += (splitNotes.length * 5) + 5;
    }
    
    // Terms and conditions
    if (invoiceData.terms) {
      doc.setFont("helvetica", "bold");
      doc.text("Terms & Conditions:", margin, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 5;
      
      const splitTerms = doc.splitTextToSize(invoiceData.terms, pageWidth - (2 * margin));
      doc.text(splitTerms, margin, yPos);
    }
    
    // Save the PDF
    const fileName = invoiceData.invoiceNumber ? 
      `Invoice-${invoiceData.invoiceNumber}.pdf` : 
      `Invoice-${new Date().getTime()}.pdf`;
      
    doc.save(fileName);
  };

  return (
    <div className="invoice-generator">
      <header className="invoice-header">
        <h1>Invoice Generator</h1>
        <div className="actions">
          <button className="btn primary" onClick={generateInvoice}>Generate Invoice</button>
          <button className="btn secondary" onClick={generatePDF}>Export PDF</button>
          <button className="btn secondary">Save Draft</button>
        </div>
      </header>

      <div className="invoice-container">
        <div className="invoice-meta-section">
          <div className="invoice-branding">
            <div className="logo-upload">
              {invoiceData.companyDetails.logo ? (
                <div className="logo-preview">
                  <img src={invoiceData.companyDetails.logo} alt="Company Logo" />
                  <button className="btn small" onClick={() => setInvoiceData({
                    ...invoiceData,
                    companyDetails: {
                      ...invoiceData.companyDetails,
                      logo: null
                    }
                  })}>Remove</button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <label htmlFor="logo-upload">Upload Logo</label>
                  <input 
                    id="logo-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
            <div className="company-fields">
              <input
                type="text"
                placeholder="Company Name"
                value={invoiceData.companyDetails.name}
                onChange={(e) => handleInputChange(e, 'companyDetails', 'name')}
              />
              <textarea
                placeholder="Company Address"
                value={invoiceData.companyDetails.address}
                onChange={(e) => handleInputChange(e, 'companyDetails', 'address')}
              />
              <input
                type="email"
                placeholder="Company Email"
                value={invoiceData.companyDetails.email}
                onChange={(e) => handleInputChange(e, 'companyDetails', 'email')}
              />
              <input
                type="tel"
                placeholder="Company Phone"
                value={invoiceData.companyDetails.phone}
                onChange={(e) => handleInputChange(e, 'companyDetails', 'phone')}
              />
            </div>
          </div>

          <div className="invoice-details">
            <div className="detail-group">
              <label>Invoice #</label>
              <input
                type="text"
                value={invoiceData.invoiceNumber}
                onChange={(e) => handleInputChange(e, null, 'invoiceNumber')}
              />
            </div>
            <div className="detail-group">
              <label>Invoice Date</label>
              <input
                type="date"
                value={invoiceData.invoiceDate}
                onChange={(e) => handleInputChange(e, null, 'invoiceDate')}
              />
            </div>
            <div className="detail-group">
              <label>Due Date</label>
              <input
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => handleInputChange(e, null, 'dueDate')}
              />
            </div>
            <div className="detail-group">
              <label>Currency</label>
              <select
                value={invoiceData.currency}
                onChange={(e) => handleInputChange(e, null, 'currency')}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="client-section">
          <h2>Bill To</h2>
          <div className="client-fields">
            <input
              type="text"
              placeholder="Client Name"
              value={invoiceData.clientDetails.name}
              onChange={(e) => handleInputChange(e, 'clientDetails', 'name')}
            />
            <textarea
              placeholder="Client Address"
              value={invoiceData.clientDetails.address}
              onChange={(e) => handleInputChange(e, 'clientDetails', 'address')}
            />
            <input
              type="email"
              placeholder="Client Email"
              value={invoiceData.clientDetails.email}
              onChange={(e) => handleInputChange(e, 'clientDetails', 'email')}
            />
            <input
              type="tel"
              placeholder="Client Phone"
              value={invoiceData.clientDetails.phone}
              onChange={(e) => handleInputChange(e, 'clientDetails', 'phone')}
            />
          </div>
        </div>

        <div className="items-section">
          <h2>Invoice Items</h2>
          <div className="items-table">
            <div className="item-header">
              <div className="item-cell description-cell">Description</div>
              <div className="item-cell quantity-cell">Quantity</div>
              <div className="item-cell price-cell">Unit Price</div>
              <div className="item-cell tax-cell">Tax (%)</div>
              <div className="item-cell amount-cell">Amount</div>
              <div className="item-cell action-cell"></div>
            </div>
            
            {invoiceData.items.map((item, index) => (
              <div className="item-row" key={item.id}>
                <div className="item-cell description-cell">
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  />
                </div>
                <div className="item-cell quantity-cell">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  />
                </div>
                <div className="item-cell price-cell">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  />
                </div>
                <div className="item-cell tax-cell">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.tax}
                    onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                  />
                </div>
                <div className="item-cell amount-cell">
                  {formatCurrency(item.amount)}
                </div>
                <div className="item-cell action-cell">
                  <button className="btn small" onClick={() => removeItem(index)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <div className="add-item-row">
              <button className="btn add-item" onClick={addItem}>+ Add Item</button>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <div className="summary-group">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoiceData.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>{formatCurrency(invoiceData.taxTotal)}</span>
            </div>
            <div className="summary-row discount">
              <div className="discount-inputs">
                <span>Discount:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={invoiceData.discountPercentage}
                  onChange={(e) => handleInputChange(e, null, 'discountPercentage')}
                />
                <span>%</span>
              </div>
              <span>{formatCurrency(invoiceData.discountAmount)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatCurrency(invoiceData.total)}</span>
            </div>
          </div>
        </div>

        <div className="additional-details">
          <div className="detail-column">
            <h3>Payment Method</h3>
            <select
              value={invoiceData.paymentMethod}
              onChange={(e) => handleInputChange(e, null, 'paymentMethod')}
            >
              <option value="">Select Payment Method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          
          <div className="detail-column">
            <h3>Notes</h3>
            <textarea
              placeholder="Additional notes for the client"
              value={invoiceData.notes}
              onChange={(e) => handleInputChange(e, null, 'notes')}
            />
          </div>
          
          <div className="detail-column">
            <h3>Terms & Conditions</h3>
            <textarea
              placeholder="Terms and conditions"
              value={invoiceData.terms}
              onChange={(e) => handleInputChange(e, null, 'terms')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
