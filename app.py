import streamlit as st
import sqlite3
import os
import hashlib
import uuid
import datetime
from pathlib import Path

# --- PAGE CONFIG ---
st.set_page_config(
    page_title="안곡중학교 공감(共感) 교원 업무 포털",
    page_icon="🏫",
    layout="wide",
    initial_sidebar_state="expanded"
)

DB_PATH = "angok_portal.db"
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# --- PASSWORD HASHING HELPER ---
def hash_password(password: str, salt: str = None) -> str:
    if not salt:
        salt = uuid.uuid4().hex[:16]
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, hashed = stored_hash.split(':')
        return hashlib.sha256((password + salt).encode('utf-8')).hexdigest() == hashed
    except Exception:
        return False

# --- DATABASE SETUP & SEEDING ---
def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        department TEXT,
        role TEXT DEFAULT 'teacher',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        icon TEXT,
        badge_color TEXT,
        sort_order INTEGER DEFAULT 0
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS blocks (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        block_id TEXT NOT NULL,
        user_id TEXT,
        uploader_name TEXT NOT NULL,
        original_name TEXT NOT NULL,
        saved_name TEXT NOT NULL,
        file_size INTEGER DEFAULT 0,
        memo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS guidance (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        time TEXT,
        location TEXT,
        teacher_name TEXT NOT NULL,
        note TEXT
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        department TEXT,
        target_date TEXT,
        completed INTEGER DEFAULT 0,
        memo TEXT
    )
    """)

    conn.commit()

    # Seed if empty
    c.execute("SELECT COUNT(*) FROM categories")
    if c.fetchone()[0] == 0:
        seed_initial_data(conn)

    conn.close()

def seed_initial_data(conn):
    c = conn.cursor()

    # Seed test users
    admin_pw = hash_password("teacher1234!")
    c.execute("INSERT OR IGNORE INTO users (id, email, password_hash, name, department, role) VALUES (?, ?, ?, ?, ?, ?)",
              ("admin-1", "admin@angok.es.kr", admin_pw, "관리교사 (교무기획부)", "교무기획부", "admin"))
    c.execute("INSERT OR IGNORE INTO users (id, email, password_hash, name, department, role) VALUES (?, ?, ?, ?, ?, ?)",
              ("teacher-1", "teacher@angok.es.kr", admin_pw, "김선생 (1학년부)", "1학년부", "teacher"))

    # Categories & Blocks
    category_data = [
        ("cat-1", "Info List", "📘", "blue", 1, [
            "연간 학사 일정", "월중계획", "전체교사시간표", "조직현황&업무분장",
            "복무 및 초과근무 처리 절차", "위임전결규정(개정후)", "교무실배치 & 내선번호 & 교실배치",
            "교직원명부(연수사인 시)", "교환수업 방법 & 결보강", "공무외국여행 상신방법(휴업일 연가)",
            "물품구입 품의 안내", "시설실 이용 안내", "보건실 이용 안내", "청소구역 & 분리수거",
            "급식지도", "학교 종합감사 수감자료 - 업무참고용", "안전공제 신청"
        ]),
        ("cat-2", "안곡중 Work", "🟣", "purple", 2, [
            "부서별 운영계획 운영자료(워크숍 자료)", "안곡중 교육계획서", "안곡중학교 규정집",
            "학생생활규정", "학업성적관리규정", "교육과정 & 생기부 작성", "수업 계획 & 평가",
            "교직원 연수 이수 현황", "출결 & 학적 관련", "교문지도 & 급식지도",
            "대회 & 행사 계획서 모음", "각종 학교 업무 관련 자료 모음", "업무용오피스"
        ]),
        ("cat-3", "교육 & 업무 관련 자료", "🟢", "emerald", 3, [
            "학교업무메뉴얼(중등)", "학교생활기록부 기재요령(중학교)", "학적 길라잡이",
            "교권 & 학폭 생활지도", "교육 & 에듀테크 관련 자료", "디지털 원패스 & 구글 워크스페이스",
            "e-DASAN 현장지원", "(교데통) 교육행정데이터통합관리시스템 메뉴얼", "나이스 지원 서비스 이용 방법",
            "경기도 고등학교 입학 내신성적 반영지침 예고(안)", "기타 교육청 자료", "랑톡 메뉴얼"
        ]),
        ("cat-4", "교원역량계발 연구학교", "🟡", "amber", 4, [
            "연수 지원", "나의 수업 릴레이", "안곡중 공유드라이브", "교내공개수업",
            "안곡중 교원역량 도서 인증제", "교원역량개발지원제도 연구회"
        ]),
        ("cat-5", "학교 기자재 관리 자료", "🔴", "rose", 5, [
            "교사용 노트북 수리, 교실 기자재 수리", "학생 무선 인터넷 주소", "학생 태블릿 PC & 충전함",
            "교실 TV 수리", "태블릿 PC 화면 공유 안 될 때 해결 방법", "개인 노트북 IP 설정 방법",
            "2026년 사용 예정 학습지원 소프트웨어 심의 목록(안곡중)", "안곡중 에듀테크 모음",
            "메신저 사용 안내", "교육용 클라우드 이용 방법", "크롬북 인터넷 연결 문제시 조치법"
        ]),
    ]

    for cat_id, title, icon, color, order, blocks in category_data:
        c.execute("INSERT INTO categories (id, title, icon, badge_color, sort_order) VALUES (?, ?, ?, ?, ?)",
                  (cat_id, title, icon, color, order))
        for b_idx, b_title in enumerate(blocks):
            b_id = f"block-{cat_id}-{b_idx}"
            c.execute("INSERT INTO blocks (id, category_id, title, description, sort_order) VALUES (?, ?, ?, ?, ?)",
                      (b_id, cat_id, b_title, f"{b_title} 관련 공문서 및 안내 파일", b_idx + 1))

    # Guidance initial items
    guidance_items = [
        ("g-1", "2026-03-03", "08:20 ~ 08:50", "정문 및 후문", "김안곡", "개학일 학생 맞이 및 등교 안전 지도"),
        ("g-2", "2026-03-03", "12:40 ~ 13:20", "급식실 2층", "이교무", "학년별 급식 순서 지도 및 질서 유지"),
        ("g-3", "2026-03-04", "08:20 ~ 08:50", "중앙 현관", "박생활", "실내화 착용 및 교복 단정 지도"),
    ]
    for g in guidance_items:
        c.execute("INSERT INTO guidance (id, date, time, location, teacher_name, note) VALUES (?, ?, ?, ?, ?, ?)", g)

    # Todo initial items
    todos = [
        ("t-1", "2026학년도 1학기 교육계획서 부서별 취합", "교무기획부", "2026-03-10", 0, "각 부서 부장님 제출 요망"),
        ("t-2", "학생 태블릿 PC 분출 및 전산망 점검", "교육정보부", "2026-03-08", 1, "충전함 번호 부여 완료"),
        ("t-3", "연간 학사일정 달력 최종 배부", "교육연구부", "2026-03-05", 0, "교무실 비치본 인쇄"),
        ("t-4", "1학년 신입생 교과서 배부 현황 점검", "1학년부", "2026-03-04", 0, "파손본 교환 신청 접수"),
    ]
    for t in todos:
        c.execute("INSERT INTO todos (id, title, department, target_date, completed, memo) VALUES (?, ?, ?, ?, ?, ?)", t)

    conn.commit()

init_db()

# --- FORMAT FILE SIZE ---
def format_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"

# --- SESSION STATE ---
if "user" not in st.session_state:
    st.session_state["user"] = None
if "selected_block_id" not in st.session_state:
    st.session_state["selected_block_id"] = None

# --- SIDEBAR: AUTHENTICATION & QUICK ACTIONS ---
with st.sidebar:
    st.markdown("### 🏫 교직원 인증")
    
    if st.session_state["user"]:
        user = st.session_state["user"]
        st.success(f"**{user['name']}** 선생님 ({user['department']})")
        st.caption(f"이메일: {user['email']} | 권한: {user['role']}")
        
        if st.button("🚪 로그아웃", use_container_width=True):
            st.session_state["user"] = None
            st.rerun()
            
        st.divider()
        st.markdown("#### ➕ 새 업무 블록 등록")
        with st.form("add_block_form", clear_on_submit=True):
            conn = get_db()
            cats = conn.execute("SELECT id, title FROM categories ORDER BY sort_order").fetchall()
            conn.close()
            
            cat_options = {c["title"]: c["id"] for c in cats}
            selected_cat_title = st.selectbox("소속 카테고리", list(cat_options.keys()))
            new_block_title = st.text_input("블록 제목", placeholder="예: 2026학년도 교원평가 매뉴얼")
            new_block_desc = st.text_input("설명 (선택)", placeholder="관련 양식 및 파일")
            
            if st.form_submit_button("블록 생성", use_container_width=True):
                if new_block_title.strip():
                    conn = get_db()
                    b_id = f"block-custom-{uuid.uuid4().hex[:8]}"
                    conn.execute("INSERT INTO blocks (id, category_id, title, description, sort_order) VALUES (?, ?, ?, ?, ?)",
                                 (b_id, cat_options[selected_cat_title], new_block_title.strip(), new_block_desc.strip(), 999))
                    conn.commit()
                    conn.close()
                    st.success("블록이 추가되었습니다!")
                    st.rerun()
    else:
        tab_login, tab_register = st.tabs(["로그인", "회원가입"])
        
        with tab_login:
            st.markdown("<p style='font-size:0.8rem; color:#666;'>파일 업로드는 로그인한 교직원만 가능합니다.</p>", unsafe_allow_html=True)
            login_email = st.text_input("학교 이메일", key="login_email")
            login_pw = st.text_input("비밀번호", type="password", key="login_pw")
            
            if st.button("교직원 로그인", type="primary", use_container_width=True):
                conn = get_db()
                user_row = conn.execute("SELECT * FROM users WHERE email = ?", (login_email,)).fetchone()
                conn.close()
                if user_row and verify_password(login_pw, user_row["password_hash"]):
                    st.session_state["user"] = dict(user_row)
                    st.success("로그인 성공!")
                    st.rerun()
                else:
                    st.error("이메일 또는 비밀번호가 올바르지 않습니다.")
                    
            st.markdown("<hr style='margin: 10px 0;'>", unsafe_allow_html=True)
            st.caption("⚡ 빠른 테스트 계정 입력")
            col_t1, col_t2 = st.columns(2)
            with col_t1:
                if st.button("👑 관리교사", use_container_width=True):
                    conn = get_db()
                    u = conn.execute("SELECT * FROM users WHERE email = 'admin@angok.es.kr'").fetchone()
                    conn.close()
                    st.session_state["user"] = dict(u)
                    st.rerun()
            with col_t2:
                if st.button("🧑‍🏫 일반교사", use_container_width=True):
                    conn = get_db()
                    u = conn.execute("SELECT * FROM users WHERE email = 'teacher@angok.es.kr'").fetchone()
                    conn.close()
                    st.session_state["user"] = dict(u)
                    st.rerun()

        with tab_register:
            reg_name = st.text_input("선생님 성함")
            reg_dept = st.selectbox("소속 부서/학년", ["교무기획부", "교육연구부", "학생생활안전부", "교육과정부", "교육정보부", "1학년부", "2학년부", "3학년부", "행정실"])
            reg_email = st.text_input("이메일", key="reg_email")
            reg_pw = st.text_input("비밀번호", type="password", key="reg_pw")
            reg_code = st.text_input("학교 인증코드", value="angok2026", help="기본코드: angok2026")
            
            if st.button("선생님 가입 완료", use_container_width=True):
                if reg_code not in ["angok2026", "안곡중"]:
                    st.error("학교 인증코드가 일치하지 않습니다.")
                elif not reg_name or not reg_email or not reg_pw:
                    st.error("모든 항목을 입력해주세요.")
                else:
                    conn = get_db()
                    try:
                        u_id = f"user-{uuid.uuid4().hex[:8]}"
                        pw_hash = hash_password(reg_pw)
                        conn.execute("INSERT INTO users (id, email, password_hash, name, department, role) VALUES (?, ?, ?, ?, ?, ?)",
                                     (u_id, reg_email, pw_hash, reg_name, reg_dept, "teacher"))
                        conn.commit()
                        u = conn.execute("SELECT * FROM users WHERE id = ?", (u_id,)).fetchone()
                        st.session_state["user"] = dict(u)
                        st.success("가입 완료! 자동 로그인되었습니다.")
                        st.rerun()
                    except sqlite3.IntegrityError:
                        st.error("이미 등록된 이메일입니다.")
                    finally:
                        conn.close()

# --- MAIN APP HEADER ---
col_head1, col_head2 = st.columns([4, 1])
with col_head1:
    st.markdown("""
    <div style="display:flex; align-items:center; gap:12px; margin-bottom: 5px;">
        <h1 style="margin:0; font-size: 2.1rem; color: #1e3a8a;">안곡중학교 공감 (共感)</h1>
        <span style="background:#dbeafe; color:#1e40af; padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600;">교원 업무 포털</span>
    </div>
    <p style="margin:0; color:#64748b; font-size: 0.95rem;">안곡중학교 선생님들을 위한 교무·학사·기자재 업무 문서 통합 아카이브</p>
    """, unsafe_allow_html=True)

with col_head2:
    conn = get_db()
    total_blocks = conn.execute("SELECT COUNT(*) FROM blocks").fetchone()[0]
    total_files = conn.execute("SELECT COUNT(*) FROM files").fetchone()[0]
    conn.close()
    st.metric(label="총 업무 블록", value=f"{total_blocks}개", delta=f"등록 파일 {total_files}건")

st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)

# --- NOTICE BANNER ---
st.info("""
📢 **안곡중학교 교원 업무 아카이브 이용 안내**  
• **파일 열람/다운로드**: 로그인 없이도 누구나 자유롭게 각 블록을 클릭하여 첨부된 업무 양식과 문서를 내려받을 수 있습니다.  
• **파일 업로드 권한**: 사이드바에서 교직원 로그인 후 HWP, PDF, 엑셀, PPT 등 모든 형식의 파일을 업로드하고 관리할 수 있습니다.  
• 가입 시 학교 인증코드: `angok2026` (또는 `안곡중`)
""")

# --- SEARCH BAR ---
search_query = st.text_input("🔍 업무 블록 또는 파일명 검색", placeholder="예: 학사 일정, 시간표, 출결, 나이스, 와이파이, HWP")

# --- POPUP / MODAL LIKE FILE MANAGER FOR SELECTED BLOCK ---
if st.session_state["selected_block_id"]:
    conn = get_db()
    curr_block = conn.execute("SELECT * FROM blocks WHERE id = ?", (st.session_state["selected_block_id"],)).fetchone()
    
    if curr_block:
        st.markdown(f"### 📂 [{curr_block['title']}] 파일 보관함")
        if curr_block["description"]:
            st.caption(curr_block["description"])

        col_m1, col_m2 = st.columns([3, 2])

        # Left: File List & Download
        with col_m1:
            st.markdown("#### 📎 첨부된 파일 목록")
            files = conn.execute("SELECT * FROM files WHERE block_id = ? ORDER BY created_at DESC", (curr_block["id"],)).fetchall()
            
            if files:
                for f in files:
                    with st.container(border=True):
                        c_f1, c_f2 = st.columns([3, 1])
                        with c_f1:
                            st.markdown(f"**📄 {f['original_name']}**")
                            st.caption(f"용량: {format_size(f['file_size'])} | 등록자: {f['uploader_name']} | 일시: {f['created_at']}")
                            if f["memo"]:
                                st.markdown(f"> *{f['memo']}*")
                        with c_f2:
                            file_path = UPLOAD_DIR / f["saved_name"]
                            if file_path.exists():
                                with open(file_path, "rb") as file_bytes:
                                    st.download_button(
                                        label="다운로드",
                                        data=file_bytes,
                                        file_name=f["original_name"],
                                        key=f"dl_{f['id']}",
                                        use_container_width=True
                                    )
                            # Delete button if author or admin
                            user = st.session_state["user"]
                            if user and (user["role"] == "admin" or user["id"] == f["user_id"]):
                                if st.button("🗑️ 삭제", key=f"del_{f['id']}", use_container_width=True):
                                    if file_path.exists():
                                        file_path.unlink()
                                    conn.execute("DELETE FROM files WHERE id = ?", (f["id"],))
                                    conn.commit()
                                    st.success("파일이 삭제되었습니다.")
                                    st.rerun()
            else:
                st.info("아직 등록된 문서가 없습니다.")

        # Right: Upload Form
        with col_m2:
            st.markdown("#### ⬆️ 새 파일 업로드")
            if st.session_state["user"]:
                uploaded_file = st.file_uploader(
                    "파일 선택 (HWP, PDF, 엑셀, PPT, ZIP 등 지원)",
                    key=f"upload_{curr_block['id']}",
                    help="최대 100MB 이하 파일"
                )
                file_memo = st.text_input("파일 설명 / 비고 (선택)", placeholder="예: 2026학년도 1학기 최종본")
                
                if st.button("🚀 파일 업로드하기", type="primary", use_container_width=True):
                    if uploaded_file is not None:
                        saved_name = f"{int(datetime.datetime.now().timestamp())}_{uuid.uuid4().hex[:6]}_{uploaded_file.name}"
                        dest = UPLOAD_DIR / saved_name
                        with open(dest, "wb") as f_out:
                            f_out.write(uploaded_file.getbuffer())
                        
                        user = st.session_state["user"]
                        uploader_title = f"{user['name']} ({user['department']})"
                        f_id = f"file-{uuid.uuid4().hex[:8]}"
                        
                        conn.execute("""
                        INSERT INTO files (id, block_id, user_id, uploader_name, original_name, saved_name, file_size, memo)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """, (f_id, curr_block["id"], user["id"], uploader_title, uploaded_file.name, saved_name, uploaded_file.size, file_memo.strip()))
                        conn.commit()
                        st.success("파일 업로드가 완료되었습니다!")
                        st.rerun()
                    else:
                        st.warning("업로드할 파일을 먼저 선택해주세요.")
            else:
                st.warning("🔒 **파일 업로드는 로그인한 교직원만 가능합니다.**")
                st.info("좌측 사이드바에서 교직원 로그인 후 바로 파일을 올리실 수 있습니다.")

        if st.button("❌ 파일 보관함 닫기"):
            st.session_state["selected_block_id"] = None
            st.rerun()
    conn.close()
    st.divider()

# --- 5 COLUMN DASHBOARD ---
st.markdown("### 📋 부서별 업무 블록 대시보드")
st.caption("원하시는 업무 블록을 클릭하시면 파일 목록 확인 및 업로드/다운로드가 가능합니다.")

conn = get_db()
categories = conn.execute("SELECT * FROM categories ORDER BY sort_order").fetchall()

cols = st.columns(len(categories))

for idx, cat in enumerate(categories):
    with cols[idx]:
        # Category Card Header
        st.markdown(f"""
        <div style="background:#f8fafc; border: 1px solid #e2e8f0; border-top: 4px solid #3b82f6; border-radius: 8px; padding: 10px; margin-bottom: 8px;">
            <strong style="font-size:0.95rem; color:#1e293b;">{cat['icon']} {cat['title']}</strong>
        </div>
        """, unsafe_allow_html=True)
        
        # Query blocks
        if search_query.strip():
            blocks = conn.execute("""
            SELECT * FROM blocks 
            WHERE category_id = ? AND (title LIKE ? OR description LIKE ?)
            ORDER BY sort_order
            """, (cat["id"], f"%{search_query.strip()}%", f"%{search_query.strip()}%")).fetchall()
        else:
            blocks = conn.execute("SELECT * FROM blocks WHERE category_id = ? ORDER BY sort_order", (cat["id"],)).fetchall()
        
        for b in blocks:
            file_count = conn.execute("SELECT COUNT(*) FROM files WHERE block_id = ?", (b["id"],)).fetchone()[0]
            badge_text = f"📎 {file_count}" if file_count > 0 else ""
            btn_label = f"{b['title']} {badge_text}".strip()
            
            if st.button(btn_label, key=f"btn_{b['id']}", use_container_width=True):
                st.session_state["selected_block_id"] = b["id"]
                st.rerun()

conn.close()

st.divider()

# --- BOTTOM WIDGETS: GUIDANCE & TODO ---
col_w1, col_w2 = st.columns(2)

with col_w1:
    st.markdown("### 👀 오늘의 생활지도")
    conn = get_db()
    guidance_rows = conn.execute("SELECT * FROM guidance ORDER BY date DESC LIMIT 10").fetchall()
    
    if guidance_rows:
        table_data = []
        for r in guidance_rows:
            table_data.append({
                "날짜": r["date"],
                "시간": r["time"] or "-",
                "장소": r["location"] or "-",
                "담당교사": r["teacher_name"],
                "비고": r["note"] or "-"
            })
        st.dataframe(table_data, use_container_width=True, hide_index=True)
    else:
        st.caption("등록된 생활지도 일정이 없습니다.")

    if st.session_state["user"]:
        with st.expander("➕ 새 생활지도 일정 등록"):
            with st.form("add_guidance_form"):
                g_date = st.date_input("날짜", datetime.date.today())
                g_time = st.text_input("시간", value="08:20 ~ 08:50")
                g_loc = st.text_input("장소", value="정문 및 교문")
                g_teacher = st.text_input("담당교사 성함", value=st.session_state["user"]["name"])
                g_note = st.text_input("비고", placeholder="지도 내용 및 유의사항")
                if st.form_submit_button("일정 등록"):
                    conn.execute("INSERT INTO guidance (id, date, time, location, teacher_name, note) VALUES (?, ?, ?, ?, ?, ?)",
                                 (f"g-{uuid.uuid4().hex[:8]}", str(g_date), g_time, g_loc, g_teacher, g_note))
                    conn.commit()
                    st.success("등록되었습니다.")
                    st.rerun()
    conn.close()

with col_w2:
    st.markdown("### ✅ To-Do List (교무 과업 체크리스트)")
    conn = get_db()
    todo_rows = conn.execute("SELECT * FROM todos ORDER BY completed ASC, target_date ASC").fetchall()
    
    if todo_rows:
        for t in todo_rows:
            is_checked = bool(t["completed"])
            status_symbol = "✔️" if is_checked else "⬜"
            c_t1, c_t2 = st.columns([4, 1])
            with c_t1:
                st.markdown(f"**{status_symbol} {t['title']}** [{t['department']}]")
                if t['target_date']:
                    st.caption(f"기한: {t['target_date']} | 비고: {t['memo'] or '-'}")
            with c_t2:
                if st.session_state["user"]:
                    new_val = 0 if is_checked else 1
                    btn_text = "취소" if is_checked else "완료"
                    if st.button(btn_text, key=f"todo_toggle_{t['id']}", use_container_width=True):
                        conn.execute("UPDATE todos SET completed = ? WHERE id = ?", (new_val, t["id"]))
                        conn.commit()
                        st.rerun()
    else:
        st.caption("등록된 과업이 없습니다.")

    if st.session_state["user"]:
        with st.expander("➕ 새 과업 추가"):
            with st.form("add_todo_form"):
                t_title = st.text_input("과업 제목")
                t_dept = st.selectbox("담당 부서", ["교무기획부", "교육연구부", "학생생활안전부", "교육과정부", "교육정보부", "1학년부", "2학년부", "3학년부", "학교전체"])
                t_date = st.date_input("마감 기한", datetime.date.today())
                t_memo = st.text_input("메모 (선택)")
                if st.form_submit_button("과업 추가"):
                    if t_title.strip():
                        conn.execute("INSERT INTO todos (id, title, department, target_date, completed, memo) VALUES (?, ?, ?, ?, ?, ?)",
                                     (f"t-{uuid.uuid4().hex[:8]}", t_title.strip(), t_dept, str(t_date), 0, t_memo.strip()))
                        conn.commit()
                        st.success("과업이 등록되었습니다.")
                        st.rerun()
    conn.close()

st.markdown("""
<div style="text-align:center; padding: 25px 0 10px; color:#94a3b8; font-size:0.8rem; border-top:1px solid #e2e8f0; margin-top:30px;">
    안곡중학교 교원 업무 통합 아카이브 · 공감 (共感) | © 2026 Angok Middle School. All files for teachers only.
</div>
""", unsafe_allow_html=True)
