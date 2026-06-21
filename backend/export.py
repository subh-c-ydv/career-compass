import io
import math
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.graphics.shapes import Drawing, Polygon, Circle, Line, String
from reportlab.graphics import renderPDF

# --- Light theme colour palette ---
C_BG         = colors.white
C_SURFACE    = colors.HexColor('#f4f6fb')
C_BORDER     = colors.HexColor('#d0d7e8')
C_ACCENT     = colors.HexColor('#3a5fd9')
C_WARM       = colors.HexColor('#c47a1a')
C_GREEN      = colors.HexColor('#2a7a52')
C_RED        = colors.HexColor('#b93030')
C_PURPLE     = colors.HexColor('#6d3fc7')
C_SKY        = colors.HexColor('#1a7aad')
C_TEXT       = colors.HexColor('#1a1d27')
C_MUTED      = colors.HexColor('#5a6180')
C_HEADING    = colors.HexColor('#0f1560')

DIM_COLOURS  = [C_ACCENT, C_WARM, C_GREEN, C_RED, C_PURPLE, C_SKY]

PAGE_W, PAGE_H = A4
MARGIN = 20 * mm
CONTENT_W = PAGE_W - 2 * MARGIN

# --- Styles ---
def make_styles():
    return {
        'title': ParagraphStyle('title',
            fontName='Helvetica-Bold', fontSize=20, textColor=C_HEADING,
            spaceAfter=10, alignment=TA_LEFT),
        'subtitle': ParagraphStyle('subtitle',
            fontName='Helvetica', fontSize=12, textColor=C_MUTED,
            spaceAfter=10, alignment=TA_LEFT),
        'section': ParagraphStyle('section',
            fontName='Helvetica-Bold', fontSize=8, textColor=C_ACCENT,
            spaceBefore=14, spaceAfter=6, alignment=TA_LEFT),
        'section_purple': ParagraphStyle('section_purple',
            fontName='Helvetica-Bold', fontSize=8, textColor=C_PURPLE,
            spaceBefore=14, spaceAfter=6, alignment=TA_LEFT),
        'body': ParagraphStyle('body',
            fontName='Helvetica', fontSize=10, textColor=C_TEXT,
            spaceAfter=6, leading=15),
        'narrative': ParagraphStyle('narrative',
            fontName='Helvetica-BoldOblique', fontSize=11, textColor=C_HEADING,
            spaceAfter=8, leading=17),
        'bullet': ParagraphStyle('bullet',
            fontName='Helvetica', fontSize=10, textColor=C_TEXT,
            spaceAfter=5, leading=14, leftIndent=12),
        'label': ParagraphStyle('label',
            fontName='Helvetica-Bold', fontSize=9, textColor=C_MUTED,
            spaceAfter=2),
        'footer': ParagraphStyle('footer',
            fontName='Helvetica', fontSize=8, textColor=C_MUTED,
            alignment=TA_CENTER),
        'q_num': ParagraphStyle('q_num',
            fontName='Helvetica-Bold', fontSize=10, textColor=C_ACCENT,
            spaceAfter=2),
    }

# --- Radar chart with labels ---
def make_radar(dimensions, scores, hub_score, width=200, height=200):
    # Extra padding around the radar for labels
    pad = 48
    d = Drawing(width, height)
    cx, cy = width / 2, height / 2
    max_r = min(width, height) / 2 - pad
    n = len(dimensions)
    if n < 2:
        return d

    def to_rad(deg): return deg * math.pi / 180

    # Start from top (90 deg in ReportLab coords where Y grows upward)
    angles = [90 - (360 / n) * i for i in range(n)]

    def axis_pt(angle, r):
        return (cx + r * math.cos(to_rad(angle)),
                cy + r * math.sin(to_rad(angle)))

    # Grid levels
    for level in range(1, 6):
        r = (level / 5) * max_r
        pts = []
        for a in angles:
            x, y = axis_pt(a, r)
            pts.extend([x, y])
        is_outer = (level == 5)
        d.add(Polygon(pts, fillColor=None,
                      strokeColor=colors.HexColor('#c8d0e8'),
                      strokeWidth=1.0 if is_outer else 0.4,
                      strokeDashArray=None if is_outer else [3, 4]))

    # Axes
    for i, angle in enumerate(angles):
        tip = axis_pt(angle, max_r)
        col = DIM_COLOURS[i % len(DIM_COLOURS)]
        d.add(Line(cx, cy, tip[0], tip[1],
                   strokeColor=col, strokeWidth=0.8, strokeOpacity=0.5))

    # Data polygon
    data_pts = []
    for i, score in enumerate(scores):
        r = (score / 10) * max_r
        x, y = axis_pt(angles[i], r)
        data_pts.extend([x, y])
    d.add(Polygon(data_pts,
                  fillColor=colors.HexColor('#3a5fd9'),
                  fillOpacity=0.15,
                  strokeColor=colors.HexColor('#3a5fd9'),
                  strokeWidth=1.5))

    # Dots
    for i, score in enumerate(scores):
        r = (score / 10) * max_r
        x, y = axis_pt(angles[i], r)
        col = DIM_COLOURS[i % len(DIM_COLOURS)]
        d.add(Circle(x, y, 4, fillColor=col,
                     strokeColor=colors.white, strokeWidth=0.8))
        d.add(String(x, y - 3, str(score),
                     fontName='Helvetica-Bold', fontSize=6,
                     fillColor=colors.white, textAnchor='middle'))

    # Hub
    hub_r = 6 + (hub_score / 10) * 10
    d.add(Circle(cx, cy, hub_r,
                 fillColor=colors.white,
                 strokeColor=C_PURPLE, strokeWidth=1.5))
    d.add(String(cx, cy - 3.5, str(hub_score),
                 fontName='Helvetica-Bold', fontSize=7,
                 fillColor=C_PURPLE, textAnchor='middle'))

    # Dimension labels — positioned outside each axis tip
    for i, dim in enumerate(angles):
        angle = angles[i]
        label_r = max_r + 14
        lx, ly = axis_pt(angle, label_r)
        col = DIM_COLOURS[i % len(DIM_COLOURS)]
        label = dimensions[i].get('label', f'Dimension {i+1}')

        # Word-wrap: split into two lines at midpoint
        words = label.split()
        mid = math.ceil(len(words) / 2)
        line1 = ' '.join(words[:mid])
        line2 = ' '.join(words[mid:]) if len(words) > 1 else ''

        # Anchor based on position relative to centre
        cos_a = math.cos(to_rad(angle))
        if cos_a > 0.3:
            anchor = 'start'
        elif cos_a < -0.3:
            anchor = 'end'
        else:
            anchor = 'middle'

        if line2:
            d.add(String(lx, ly + 5, line1,
                         fontName='Helvetica-Bold', fontSize=7,
                         fillColor=col, textAnchor=anchor))
            d.add(String(lx, ly - 4, line2,
                         fontName='Helvetica-Bold', fontSize=7,
                         fillColor=col, textAnchor=anchor))
        else:
            d.add(String(lx, ly, line1,
                         fontName='Helvetica-Bold', fontSize=7,
                         fillColor=col, textAnchor=anchor))

    return d

# --- Score table ---
def make_score_table(dimensions, scores, hub_score, coherence, styles):
    rows = [[
        Paragraph('Dimension', styles['label']),
        Paragraph('Score', styles['label'])
    ]]
    for i, dim in enumerate(dimensions):
        col = DIM_COLOURS[i % len(DIM_COLOURS)]
        rows.append([
            Paragraph(dim.get('label', f'Dimension {i+1}'), styles['body']),
            Paragraph(f"{scores[i]}/10", ParagraphStyle(f'sc{i}',
                fontName='Helvetica-Bold', fontSize=10,
                textColor=col, spaceAfter=4))
        ])
    rows.append([
        Paragraph('Hub Strength', styles['body']),
        Paragraph(f"{hub_score}/10", ParagraphStyle('hub',
            fontName='Helvetica-Bold', fontSize=10,
            textColor=C_PURPLE, spaceAfter=4))
    ])
    rows.append([
        Paragraph('Overall Coherence', styles['body']),
        Paragraph(f"{coherence}/10", ParagraphStyle('coh',
            fontName='Helvetica-Bold', fontSize=10,
            textColor=C_ACCENT, spaceAfter=4))
    ])

    t = Table(rows, colWidths=[CONTENT_W * 0.30, 52])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_SURFACE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, C_SURFACE]),
        ('GRID', (0, 0), (-1, -1), 0.4, C_BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
    ]))
    return t

# --- Main export function ---
def generate_pdf(profile: dict, analysis: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=MARGIN, rightMargin=MARGIN,
                            topMargin=MARGIN, bottomMargin=MARGIN,
                            title=f"Career Compass Map — {profile.get('name', '')}",
                            author="Career Compass")

    S = make_styles()
    story = []

    dimensions = profile.get('dimensions', [])
    name = profile.get('name', 'Unknown')

    scores = [analysis.get('dimension_scores', {}).get(f'dimension_{i+1}', 0)
              for i in range(len(dimensions))]
    hub_score = analysis.get('hub_strength', 0)
    coherence = analysis.get('coherence_score', 0)

    # --- Header ---
    story.append(Paragraph("Career Compass Map", S['title']))
    story.append(Paragraph(name, S['subtitle']))
    story.append(HRFlowable(width=CONTENT_W, color=C_BORDER, thickness=1, spaceAfter=12))

    # --- Scores + Radar side by side ---
    radar_size = 210
    score_table = make_score_table(dimensions, scores, hub_score, coherence, S)
    radar = make_radar(dimensions, scores, hub_score, width=radar_size, height=radar_size)
    radar_widget = renderPDF.Drawing(radar_size, radar_size, radar)

    combined = Table(
        [[score_table, radar_widget]],
        colWidths=[CONTENT_W - radar_size - 10, radar_size + 10]
    )
    combined.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(combined)
    story.append(Spacer(1, 10))

    # --- Narrative Thread ---
    if analysis.get('narrative_thread'):
        story.append(HRFlowable(width=CONTENT_W, color=C_BORDER, thickness=1, spaceAfter=8))
        story.append(Paragraph('Narrative Thread', S['section']))
        nt_table = Table(
            [[Paragraph(f'"{analysis["narrative_thread"]}"', S['narrative'])]],
            colWidths=[CONTENT_W]
        )
        nt_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), C_SURFACE),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('LINEBEFORE', (0, 0), (0, -1), 3, C_ACCENT),
        ]))
        story.append(nt_table)
        story.append(Spacer(1, 8))

    # --- Coherence + Hub Assessment ---
    story.append(HRFlowable(width=CONTENT_W, color=C_BORDER, thickness=1, spaceAfter=8))
    col_w = (CONTENT_W - 10) / 2
    assess = Table([[
        [Paragraph('Coherence', S['section']),
         Paragraph(analysis.get('coherence_summary', ''), S['body'])],
        [Paragraph('Hub Assessment', S['section_purple']),
         Paragraph(analysis.get('hub_assessment', ''), S['body'])]
    ]], colWidths=[col_w, col_w])
    assess.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (0, -1), 12),
        ('LEFTPADDING', (1, 0), (1, -1), 12),
        ('LINEAFTER', (0, 0), (0, -1), 0.5, C_BORDER),
    ]))
    story.append(assess)

    # --- List sections ---
    def list_section(title, items, colour):
        if not items:
            return
        story.append(HRFlowable(width=CONTENT_W, color=C_BORDER, thickness=1, spaceAfter=8))
        story.append(Paragraph(title, ParagraphStyle(f'ls_{title}',
            fontName='Helvetica-Bold', fontSize=8, textColor=colour,
            spaceBefore=14, spaceAfter=6)))
        for item in items:
            story.append(Paragraph(f'› {item}', S['bullet']))

    list_section('Strengths', analysis.get('strengths', []), C_GREEN)
    list_section('Tensions & Gaps', analysis.get('tensions', []), C_RED)
    list_section('Opportunities', analysis.get('opportunities', []), C_WARM)

    # --- Coaching Questions ---
    questions = analysis.get('reflection_questions', [])
    if questions:
        story.append(HRFlowable(width=CONTENT_W, color=C_BORDER, thickness=1, spaceAfter=8))
        story.append(Paragraph('Coaching Questions', S['section']))
        for i, q in enumerate(questions):
            q_table = Table(
                [[Paragraph(f'Q{i+1}', ParagraphStyle(f'qn{i}',
                    fontName='Helvetica-Bold', fontSize=10,
                    textColor=C_ACCENT)),
                  Paragraph(q, S['body'])]],
                colWidths=[24, CONTENT_W - 24]
            )
            q_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LINEBELOW', (0, 0), (-1, -1), 0.3, C_BORDER),
            ]))
            story.append(q_table)

    # --- Footer ---
    story.append(Spacer(1, 16))
    story.append(HRFlowable(width=CONTENT_W, color=C_BORDER, thickness=1, spaceAfter=6))
    story.append(Paragraph('Generated by Career Compass', S['footer']))

    doc.build(story)
    buf.seek(0)
    return buf.read()