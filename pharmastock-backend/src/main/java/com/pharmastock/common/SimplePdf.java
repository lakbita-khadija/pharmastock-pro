package com.pharmastock.common;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Generateur PDF sans dependance externe.
 * - fromLines(...)  : document texte simple (ticket de caisse)
 * - report(...)     : rapport professionnel avec bandeau, tableau et pagination
 * Police Helvetica en WinAnsiEncoding -> accents corrects (e, a, c, ...).
 */
public final class SimplePdf {

    private SimplePdf() {}

    private static final int PAGE_W = 595, PAGE_H = 842;
    private static final int ML = 45, MT = 50, MB = 55;
    private static final int ROW_H = 20, HEAD_H = 24;
    private static final String GREEN   = "0.051 0.580 0.533";
    private static final String GREEN_L = "0.878 0.953 0.937";
    private static final String ROW_ALT = "0.965 0.969 0.973";

    // ============================================================
    //  Rapport professionnel (tableau)
    // ============================================================
    public static byte[] report(String title, String subtitle,
                                String[] headers, int[] colW, List<String[]> rows) {
        int totalW = 0;
        for (int w : colW) totalW += w;
        int[] xs = new int[colW.length];
        xs[0] = ML;
        for (int i = 1; i < colW.length; i++) xs[i] = xs[i - 1] + colW[i - 1];

        int tableTop = PAGE_H - MT - 40;
        int firstRowTop = tableTop - HEAD_H;
        int bottom = MB + 8;
        int maxRows = Math.max(1, (firstRowTop - bottom) / ROW_H);

        List<List<String[]>> pages = new ArrayList<>();
        if (rows == null || rows.isEmpty()) {
            pages.add(new ArrayList<>());
        } else {
            for (int i = 0; i < rows.size(); i += maxRows) {
                pages.add(rows.subList(i, Math.min(i + maxRows, rows.size())));
            }
        }
        int nPages = pages.size();

        List<String> streams = new ArrayList<>();
        for (int p = 0; p < nPages; p++) {
            List<String[]> prows = pages.get(p);
            StringBuilder s = new StringBuilder();
            // bandeau vert + titre
            s.append(GREEN).append(" rg 0 ").append(PAGE_H - MT).append(" ").append(PAGE_W).append(" ").append(MT).append(" re f\n");
            s.append("BT /F2 18 Tf 1 1 1 rg ").append(ML).append(" ").append(PAGE_H - 32).append(" Td (").append(esc(title)).append(") Tj ET\n");
            s.append("BT /F1 10 Tf 0.42 0.45 0.50 rg ").append(ML).append(" ").append(PAGE_H - MT - 18).append(" Td (").append(esc(subtitle)).append(") Tj ET\n");
            // en-tete tableau
            int y = tableTop;
            s.append(GREEN_L).append(" rg ").append(ML).append(" ").append(y - HEAD_H).append(" ").append(totalW).append(" ").append(HEAD_H).append(" re f\n");
            for (int c = 0; c < headers.length; c++) {
                s.append("BT /F2 10 Tf 0.05 0.30 0.27 rg ").append(xs[c] + 6).append(" ").append(y - 16).append(" Td (").append(esc(headers[c])).append(") Tj ET\n");
            }
            // lignes
            int ry = y - HEAD_H;
            for (int ri = 0; ri < prows.size(); ri++) {
                String[] row = prows.get(ri);
                if (ri % 2 == 1) {
                    s.append(ROW_ALT).append(" rg ").append(ML).append(" ").append(ry - ROW_H).append(" ").append(totalW).append(" ").append(ROW_H).append(" re f\n");
                }
                for (int c = 0; c < headers.length && c < row.length; c++) {
                    s.append("BT /F1 9.5 Tf 0.20 0.23 0.27 rg ").append(xs[c] + 6).append(" ").append(ry - 14).append(" Td (").append(esc(row[c])).append(") Tj ET\n");
                }
                ry -= ROW_H;
            }
            // cadre
            s.append("0.85 0.87 0.89 RG 0.6 w ").append(ML).append(" ").append(ry).append(" ").append(totalW).append(" ").append(y - ry).append(" re S\n");
            // pied de page
            s.append("BT /F1 8 Tf 0.6 0.63 0.67 rg ").append(ML).append(" ").append(MB - 20)
             .append(" Td (PharmaStock - Rapport genere automatiquement   |   Page ").append(p + 1).append("/").append(nPages).append(") Tj ET");
            streams.add(s.toString());
        }

        return assemble(streams, true);
    }

    // ============================================================
    //  Document texte simple (ticket de caisse)
    // ============================================================
    public static byte[] fromLines(String title, List<String> lines) {
        List<String> all = new ArrayList<>();
        if (title != null) { all.add(title); all.add(""); }
        all.addAll(lines);
        StringBuilder content = new StringBuilder();
        content.append("BT\n/F1 11 Tf\n14 TL\n50 800 Td\n");
        int max = Math.min(all.size(), 52);
        for (int i = 0; i < max; i++) {
            content.append("(").append(esc(all.get(i))).append(") Tj\nT*\n");
        }
        content.append("ET");
        List<String> streams = new ArrayList<>();
        streams.add(content.toString());
        return assemble(streams, false);
    }

    // ============================================================
    //  Assemblage PDF (objets + xref)
    // ============================================================
    private static byte[] assemble(List<String> streams, boolean withBoldFont) {
        int nPages = streams.size();
        List<String> objs = new ArrayList<>();
        objs.add("<< /Type /Catalog /Pages 2 0 R >>");

        int[] pageIds = new int[nPages];
        int[] contentIds = new int[nPages];
        for (int i = 0; i < nPages; i++) { pageIds[i] = 5 + i * 2; contentIds[i] = 6 + i * 2; }
        StringBuilder kids = new StringBuilder();
        for (int i = 0; i < nPages; i++) kids.append(pageIds[i]).append(" 0 R ");
        objs.add("<< /Type /Pages /Kids [" + kids.toString().trim() + "] /Count " + nPages + " >>");
        objs.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
        objs.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

        for (int i = 0; i < nPages; i++) {
            objs.add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + PAGE_W + " " + PAGE_H + "] "
                    + "/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents " + contentIds[i] + " 0 R >>");
            byte[] sb = streams.get(i).getBytes(StandardCharsets.ISO_8859_1);
            objs.add("<< /Length " + sb.length + " >>\nstream\n" + streams.get(i) + "\nendstream");
        }

        StringBuilder pdf = new StringBuilder("%PDF-1.4\n");
        int[] offsets = new int[objs.size() + 1];
        for (int i = 0; i < objs.size(); i++) {
            offsets[i + 1] = pdf.toString().getBytes(StandardCharsets.ISO_8859_1).length;
            pdf.append(i + 1).append(" 0 obj\n").append(objs.get(i)).append("\nendobj\n");
        }
        int xrefPos = pdf.toString().getBytes(StandardCharsets.ISO_8859_1).length;
        pdf.append("xref\n0 ").append(objs.size() + 1).append("\n");
        pdf.append("0000000000 65535 f \n");
        for (int i = 1; i <= objs.size(); i++) {
            pdf.append(String.format("%010d 00000 n \n", offsets[i]));
        }
        pdf.append("trailer\n<< /Size ").append(objs.size() + 1).append(" /Root 1 0 R >>\nstartxref\n")
           .append(xrefPos).append("\n%%EOF");

        return pdf.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    private static String esc(String s) {
        if (s == null) return "";
        StringBuilder b = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (c == '\\' || c == '(' || c == ')') b.append('\\').append(c);
            else if (c < 256) b.append(c);
            else b.append('?');
        }
        return b.toString();
    }
}
