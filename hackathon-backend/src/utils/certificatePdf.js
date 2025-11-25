import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

// Generates a PDF certificate styled like the provided HTML/CSS sample
export function generateCertificatePDF({ student_name, team_name, project_title, avg_innovation, avg_technical, avg_presentation, avg_total, judges }) {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const stream = new PassThrough();
  doc.pipe(stream);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Background
  doc.rect(0, 0, pageWidth, pageHeight).fill('#f2f2f2');

  // Certificate wrapper (white box)
  const wrapperX = 60, wrapperY = 40, wrapperW = pageWidth - 120, wrapperH = pageHeight - 80;
  doc.save();
  doc.roundedRect(wrapperX, wrapperY, wrapperW, wrapperH, 18).fill('#fff');
  doc.restore();
  doc.save();
  doc.lineWidth(2).strokeColor('#ddd').roundedRect(wrapperX, wrapperY, wrapperW, wrapperH, 18).stroke();
  doc.restore();
  // Shadow effect (simulate with a gray border)
  doc.save();
  doc.lineWidth(8).strokeColor('#e0e0e0').roundedRect(wrapperX+6, wrapperY+6, wrapperW-12, wrapperH-12, 16).stroke();
  doc.restore();

  // Left blue shapes
  // Main blue bar
  doc.save();
  doc.fillColor('#1a73e8');
  doc.moveTo(wrapperX, wrapperY)
    .lineTo(wrapperX+90, wrapperY+20)
    .lineTo(wrapperX+90, wrapperY+wrapperH-20)
    .lineTo(wrapperX, wrapperY+wrapperH)
    .closePath().fill();
  doc.restore();
  // Second blue bar
  doc.save();
  doc.fillColor('#4fa3ff');
  doc.moveTo(wrapperX+60, wrapperY+30)
    .lineTo(wrapperX+120, wrapperY+50)
    .lineTo(wrapperX+120, wrapperY+wrapperH-50)
    .lineTo(wrapperX+60, wrapperY+wrapperH-30)
    .closePath().fill();
  doc.restore();

  // Circle logo
  const circleX = wrapperX+80, circleY = wrapperY+180, circleR = 65;
  doc.save();
  doc.circle(circleX, circleY, circleR).fill('#fff');
  doc.lineWidth(6).strokeColor('#1a73e8').circle(circleX, circleY, circleR).stroke();
  doc.font('Helvetica-Bold').fontSize(26).fillColor('#1a73e8');
  doc.text('NCT\nCODING', circleX-45, circleY-28, { width: 90, align: 'center', lineGap: 2 });
  doc.restore();

  // Top logos (use placeholders)
  doc.image('https://upload.wikimedia.org/wikipedia/commons/8/8f/Niagara_College_logo.png', wrapperX+220, wrapperY+30, { width: 70 });
  doc.image('https://seeklogo.com/images/N/niagara-college-toronto-logo.png', wrapperX+320, wrapperY+30, { width: 70 });

  // Subtitle
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#1976d2');
  doc.text('RUNNER UP OF THE S-2025', 0, wrapperY+110, { align: 'center' });

  // Main title
  doc.font('Helvetica-Bold').fontSize(54).fillColor('#002c6a');
  doc.text('HACKATHON', 0, wrapperY+150, { align: 'center', characterSpacing: 2 });

  // Certificate text
  doc.font('Helvetica').fontSize(20).fillColor('#4a4a4a');
  doc.text('THIS CERTIFICATE IS AWARDED TO', 0, wrapperY+220, { align: 'center' });

  // Name line
  doc.save();
  const nameY = wrapperY+260;
  doc.font('Helvetica-Bold').fontSize(28).fillColor('#333');
  doc.text(student_name, wrapperX+180, nameY, { width: wrapperW-360, align: 'center' });
  // Draw line below name
  const nameLineY = nameY+32;
  doc.moveTo(wrapperX+220, nameLineY).lineTo(wrapperX+wrapperW-220, nameLineY).lineWidth(2).strokeColor('#444').stroke();
  doc.restore();

  // Team and project
  doc.font('Helvetica').fontSize(16).fillColor('#333');
  doc.text(`Team: ${team_name}`, 0, nameLineY+18, { align: 'center' });
  doc.text(`Project: ${project_title}`, 0, nameLineY+38, { align: 'center' });

  // Scores
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#1976d2');
  doc.text(`Innovation: ${avg_innovation}   Technical: ${avg_technical}   Presentation: ${avg_presentation}   Total: ${avg_total}`, 0, nameLineY+65, { align: 'center' });

  // Judges
  if (judges && judges.length > 0) {
    doc.font('Helvetica').fontSize(12).fillColor('#333');
    doc.text(`Judged by: ${judges.join(', ')}`, 0, nameLineY+90, { align: 'center' });
  }

  // Signatures
  const sigY = wrapperY+wrapperH-120;
  // Left signature
  doc.save();
  doc.moveTo(wrapperX+120, sigY).lineTo(wrapperX+320, sigY).lineWidth(2).strokeColor('#555').stroke();
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#222').text('Shallen Chen', wrapperX+120, sigY+8, { width: 200, align: 'center' });
  doc.font('Helvetica').fontSize(13).fillColor('#666').text('Associate Dean', wrapperX+120, sigY+28, { width: 200, align: 'center' });
  doc.restore();
  // Right signature
  doc.save();
  doc.moveTo(wrapperX+wrapperW-320, sigY).lineTo(wrapperX+wrapperW-120, sigY).lineWidth(2).strokeColor('#555').stroke();
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#222').text('Subagini Manivannan', wrapperX+wrapperW-320, sigY+8, { width: 200, align: 'center' });
  doc.font('Helvetica').fontSize(13).fillColor('#666').text('Academic Director', wrapperX+wrapperW-320, sigY+28, { width: 200, align: 'center' });
  doc.restore();

  // Footer
  doc.font('Helvetica').fontSize(10).fillColor('#aaa').text('Generated by Hackathon Portal', 0, wrapperY+wrapperH-30, { align: 'center' });

  doc.end();
  return stream;
}
