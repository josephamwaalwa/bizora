import React from 'react';
import type { Quotation } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getLogoOptions } from '../../utils/logo';

interface QuotationPrintableDocumentProps {
  document: Quotation;
}

export const QuotationPrintableDocument: React.FC<QuotationPrintableDocumentProps> = ({ document }) => {
  const business = document.businessSnapshot;
  const client = document.clientSnapshot;
  const logo = getLogoOptions(business);

  return (
    <article className="quote-document-container bg-white text-slate-900 mx-auto shadow-paper font-sans">
      <table className="quote-print-table text-left text-xs">
        <colgroup>
          <col className="quote-col-number" />
          <col className="quote-col-description" />
          <col className="quote-col-quantity" />
          <col className="quote-col-unit-price" />
          <col className="quote-col-total" />
        </colgroup>
        <thead>
          <tr>
            <th colSpan={5} className="quote-letterhead-cell">
              <div className="quote-letterhead">
                <div className="quote-business-identity">
                  {business.logoUrl && (
                    <div
                      className="quote-logo-box"
                      style={{
                        width: `${logo.size}px`,
                        height: `${Math.min(logo.size, 64)}px`,
                        padding: `${logo.padding}px`,
                        backgroundColor: logo.backgroundColor,
                      }}
                    >
                      <img
                        src={business.logoUrl}
                        alt={`${business.name} logo`}
                        style={{
                          objectFit: logo.fit,
                          objectPosition: `${logo.alignment} center`,
                        }}
                      />
                    </div>
                  )}
                  <div className="quote-business-details">
                    <h1>{business.name}</h1>
                    {business.tagline && <p className="quote-tagline">{business.tagline}</p>}
                    <div className="quote-contact-details">
                      {business.address && <span>{business.address}</span>}
                      {[business.city, business.country, business.postalCode].filter(Boolean).length > 0 && (
                        <span>{[business.city, business.country, business.postalCode].filter(Boolean).join(', ')}</span>
                      )}
                      {[business.email, business.phone, business.website].filter(Boolean).length > 0 && (
                        <span>{[business.email, business.phone, business.website].filter(Boolean).join('  ·  ')}</span>
                      )}
                      {(business.taxNumber || business.registrationNumber) && (
                        <span>
                          {[business.taxNumber && `Tax/VAT: ${business.taxNumber}`, business.registrationNumber && `Reg: ${business.registrationNumber}`]
                            .filter(Boolean)
                            .join('  ·  ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="quote-reference">
                  <p className="quote-document-title">Quotation</p>
                  <p className="quote-document-number">{document.quotationNumber}</p>
                  <dl>
                    <div>
                      <dt>Issue date</dt>
                      <dd>{formatDate(document.issueDate)}</dd>
                    </div>
                    <div>
                      <dt>Valid until</dt>
                      <dd>{formatDate(document.expiryDate)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </th>
          </tr>
          <tr className="quote-column-headings">
            <th scope="col">#</th>
            <th scope="col">Description</th>
            <th scope="col">Qty</th>
            <th scope="col">Unit price ({document.currencySymbol})</th>
            <th scope="col">Total ({document.currencySymbol})</th>
          </tr>
        </thead>
        <tbody>
          <tr className="quote-recipient-row">
            <td colSpan={5}>
              <span className="quote-section-label">Bill to</span>
              <div className="quote-client-details">
                <strong>{client.companyName || client.name}</strong>
                {client.companyName && client.name && <span>Attn: {client.name}</span>}
                {client.address && <span>{client.address}</span>}
                {[client.city, client.country].filter(Boolean).length > 0 && (
                  <span>{[client.city, client.country].filter(Boolean).join(', ')}</span>
                )}
                {[client.email, client.phone].filter(Boolean).length > 0 && (
                  <span>{[client.email, client.phone].filter(Boolean).join('  ·  ')}</span>
                )}
                {client.vatNumber && <span>VAT No: {client.vatNumber}</span>}
              </div>
            </td>
          </tr>
          {document.items.map((item, index) => (
            <tr key={item.id} className="quote-item-row">
              <td className="quote-item-number">{index + 1}</td>
              <td className="quote-item-description">{item.description}</td>
              <td className="quote-item-quantity">{item.quantity}</td>
              <td className="quote-item-amount">
                {formatCurrency(item.unitPrice, document.currency, document.currencySymbol).replace(document.currencySymbol, '').trim()}
              </td>
              <td className="quote-item-amount quote-item-total">
                {formatCurrency(item.total, document.currency, document.currencySymbol).replace(document.currencySymbol, '').trim()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="quote-summary">
        <div className="quote-notes-and-payment">
          {document.notes && (
            <div className="quote-extra-section">
              <h2>Notes</h2>
              <p>{document.notes}</p>
            </div>
          )}

          {business.bankDetails?.accountNumber && (
            <div className="quote-extra-section">
              <h2>Payment details</h2>
              <dl className="quote-bank-details">
                {business.bankDetails.bankName && (
                  <div><dt>Bank</dt><dd>{business.bankDetails.bankName}</dd></div>
                )}
                {business.bankDetails.accountName && (
                  <div><dt>Account name</dt><dd>{business.bankDetails.accountName}</dd></div>
                )}
                <div><dt>Account number</dt><dd>{business.bankDetails.accountNumber}</dd></div>
                {business.bankDetails.branchCode && (
                  <div><dt>Branch code</dt><dd>{business.bankDetails.branchCode}</dd></div>
                )}
                {business.bankDetails.swiftCode && (
                  <div><dt>SWIFT / BIC</dt><dd>{business.bankDetails.swiftCode}</dd></div>
                )}
                <div><dt>Reference</dt><dd>{document.quotationNumber}</dd></div>
              </dl>
            </div>
          )}
        </div>

        <div className="quote-totals">
          <div><span>Subtotal</span><strong>{formatCurrency(document.subtotal, document.currency, document.currencySymbol)}</strong></div>
          {document.discountAmount > 0 && (
            <div>
              <span>Discount {document.discountType === 'percentage' ? `(${document.discountValue}%)` : ''}</span>
              <strong>- {formatCurrency(document.discountAmount, document.currency, document.currencySymbol)}</strong>
            </div>
          )}
          {document.taxAmount > 0 && (
            <div>
              <span>{document.taxName || 'Tax'} ({document.taxRate}%)</span>
              <strong>{formatCurrency(document.taxAmount, document.currency, document.currencySymbol)}</strong>
            </div>
          )}
          <div className="quote-grand-total">
            <span>Total</span>
            <strong>{formatCurrency(document.grandTotal, document.currency, document.currencySymbol)}</strong>
          </div>
        </div>
      </section>

      {document.terms && (
        <section className="quote-terms">
          <h2>Terms &amp; Conditions</h2>
          <p>{document.terms}</p>
        </section>
      )}

      <section className="quote-signatures">
        <div>
          <span className="quote-signature-line" />
          <strong>Authorized signature</strong>
          <span>{business.name}</span>
        </div>
        <div>
          <span className="quote-signature-line" />
          <strong>Client acceptance signature</strong>
          <span>{client.name}</span>
        </div>
      </section>
    </article>
  );
};
