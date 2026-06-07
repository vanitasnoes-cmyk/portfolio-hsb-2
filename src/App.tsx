import { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, X, GraduationCap, CheckSquare, Mail, Layers, FileText, ChevronRight, BookOpen, AlertTriangle, Eye, FileDown, LayoutGrid, Columns, Printer, ListTree, Moon, Sun } from 'lucide-react';
import stepEvidenceByProject from './data/step-evidence.json';
import { LESSON_STEPS } from './data/lesson-steps';
import { ProcessStepAccordion, getDefaultExpandedSteps } from './components/ProcessStepAccordion';
import { QuickNavDrawer } from './components/QuickNavDrawer';
import { PortfolioIntroMedia } from './components/PortfolioIntroMedia';
import { LessonMiniToc } from './components/LessonMiniToc';
import { CustomCursor } from './components/CustomCursor';
import { ScrollHighlightSection } from './components/ScrollHighlightSection';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from './components/ui/card';
import { cn } from './lib/utils';
import { RubricChecklist } from './components/RubricChecklist';
import { RubricProgressMap } from './components/RubricProgressMap';
import { LessonRubricSupplements } from './components/RubricSupplements';
import {
  parsePortfolioUrl,
  applyPortfolioUrl,
  getFullPortfolioUrl,
  PORTFOLIO_LESSON_HASH_RE,
  type PortfolioView,
} from './utils/portfolioUrl';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [currentSection, setCurrentSection] = useState('gioi-thieu');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<PortfolioView>('gallery');
  const [quickNavOpen, setQuickNavOpen] = useState(false);
  const [urlSynced, setUrlSynced] = useState(false);
  const [deepLinkStep, setDeepLinkStep] = useState<number | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [linkCopied, setLinkCopied] = useState(false);
  /** Chỉ ghi #bai-N lên URL sau khi người dùng chọn bài (tránh nhảy section lúc mở trang) */
  const [urlLessonIndex, setUrlLessonIndex] = useState<number | null>(null);
  const scrollToLessonOnLoadRef = useRef(
    PORTFOLIO_LESSON_HASH_RE.test(window.location.hash),
  );

  // Dark mode — persisted in localStorage, class toggled on <html>
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Keyboard listener for Escape key to close lightbox modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resetDetailPaneScroll = () => {
    const pane = document.getElementById('dashboard-detail-pane');
    if (pane) pane.scrollTop = 0;
  };

  const scrollToDashboardSection = () => {
    const el = document.getElementById('dashboard-view-container') || document.getElementById('du-an');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Reset scroll pane when switching lessons or view mode
  useEffect(() => {
    resetDetailPaneScroll();
  }, [activeTab, viewMode]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Track scrolling to set active menu highlight
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['gioi-thieu', 'du-an', 'tong-ket'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setCurrentSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#gioi-thieu', label: 'Lời Mở Đầu', id: 'gioi-thieu' },
    { href: '#du-an', label: 'Bài Tập Thực Hành', id: 'du-an' },
    { href: '#tong-ket', label: 'Tổng Kết & Suy Ngẫm', id: 'tong-ket' },
  ];

  // The 6 structural digital assignments from the rubric guidelines with detailed pharmaceutical context
  const portfolioProjects = [
    {
      id: 'bt1',
      coverImage: '/images/anh_1.jpg',
      label: 'Bài 1: Hệ điều hành & Tệp tin',
      fullName: 'Bài tập 1 — Quản trị Hệ điều hành & Thao tác tệp tin trên Windows',
      objective: 'Làm chủ các thao tác cơ bản trên Windows File Explorer, tổ chức lưu trữ khoa học với cấu trúc thư mục học thuật chuẩn "ThucHanh_ToBaoNhi" và quản lý vòng đời tệp tin.',
      process: 'Tạo thư mục ThucHanh_ToBaoNhi, tạo file GhiChu.txt và đổi tên thành GhiChuQuanTrong.txt. Tạo thư mục con TaiLieu, thực hiện sao chép và di chuyển tệp tin. Quản lý xóa tệp qua Recycle Bin và xóa vĩnh viễn (Shift + Delete).',
      product: 'Thư mục học thuật "ThucHanh_ToBaoNhi" có cấu trúc phân cấp chuẩn và ảnh chụp minh chứng.',
      fileUrl: '/files/Bai_1_ToBaoNhi.pdf',
      fileName: 'Bai_1_ToBaoNhi.pdf',
      fileType: 'pdf',
      skills: ['Windows 11', 'Quản lý tệp tin', 'Bảo mật hệ thống', 'Phân cấp dữ liệu'],
      images: ['/images/steps/bt1/01.png', '/images/steps/bt1/02.png'],
      imageDescriptions: [
        'Ảnh 1: Cấu trúc thư mục "ThucHanh_ToBaoNhi" được phân cấp khoa học trên File Explorer.',
        'Ảnh 2: Quá trình thao tác tạo mới, sao chép và di chuyển tệp tin vào thư mục TaiLieu.'
      ],
      detailedSummary: 'Bài tập 1 tập trung rèn luyện các thao tác quản lý tệp tin và thư mục trên Windows. Em đã thiết lập thư mục học thuật chuẩn "ThucHanh_ToBaoNhi" và các thư mục con để lưu trữ dữ liệu. Qua đó nắm vững các thao tác Copy, Cut, Paste, Recycle Bin và Shift+Delete.'
    },
    {
      id: 'bt2',
      coverImage: '/images/anh_2.jpg',
      label: 'Bài 2: Đánh giá tài liệu học thuật',
      fullName: 'Bài tập 2 — Báo cáo đánh giá độ tin cậy của tài liệu nghiên cứu AI',
      objective: 'Ứng dụng các công cụ tìm kiếm nâng cao (Google Scholar, ScienceDirect) kết hợp toán tử Boolean để thu thập và đánh giá độ tin cậy của 10 tài liệu về chủ đề "AI trong Bảo trì dự đoán".',
      process: 'Xây dựng biểu thức Boolean, tìm kiếm tài liệu trên Google Scholar, lập bảng Excel chấm điểm 10 tài liệu dựa trên 5 tiêu chí chuẩn hóa (Tác giả, Đơn vị xuất bản, Phương pháp, Số lần trích dẫn, Tính cập nhật).',
      product: 'Báo cáo đánh giá học thuật và Bảng Excel thẩm định độ tin cậy của 10 nguồn tài liệu.',
      fileUrl: '/files/Bai_2_ToBaoNhi.pdf',
      fileName: 'Bai_2_ToBaoNhi.pdf',
      fileType: 'pdf',
      skills: ['Google Scholar', 'Boolean Search', 'Thẩm định tài liệu', 'Excel'],
      images: [],
      imageDescriptions: [],
      detailedSummary: 'Bài tập 2 rèn luyện kỹ năng tìm kiếm và đánh giá tài liệu học thuật một cách khoa học. Em đã áp dụng các tiêu chí khắt khe để thẩm định 10 tài liệu về Bảo trì dự đoán, giúp nâng cao tư duy phản biện và sàng lọc thông tin chất lượng cao.'
    },
    {
      id: 'bt3',
      coverImage: '/images/anh_3.jpg',
      label: 'Bài 3: Kỹ nghệ Prompt Engineering',
      fullName: 'Bài tập 3 — Tối ưu hóa tương tác AI giải thích Blockchain',
      objective: 'So sánh hiệu quả của các kỹ thuật viết prompt từ cơ bản đến nâng cao (CLEAR/CRAC) để yêu cầu AI giải thích khái niệm phức tạp Blockchain cho học sinh cấp 3.',
      process: 'Thiết kế 3 cấp độ prompt: Cơ bản (Zero-shot), Cải tiến (thêm cấu trúc) và Nâng cao (Role, Few-shot, Chain-of-Thought). Chạy thử trên Google Gemini và lập bảng đối chiếu chất lượng phản hồi.',
      product: 'Báo cáo kỹ thuật Prompt Engineering và Bảng so sánh 3 cấp độ prompt trên Gemini.',
      fileUrl: '/files/Bai_3_ToBaoNhi.pdf',
      fileName: 'Bai_3_ToBaoNhi.pdf',
      fileType: 'pdf',
      skills: ['Prompt Engineering', 'CLEAR / CRAC', 'Few-shot Learning', 'Chain-of-Thought'],
      images: ['/images/steps/bt3/01.png', '/images/steps/bt3/02.png'],
      imageDescriptions: [
        'Ảnh 1: Thiết kế và thử nghiệm prompt nâng cao CLEAR/CRAC trên Google Gemini.',
        'Ảnh 2: Bảng so sánh hiệu quả và độ chi tiết của phản hồi giữa các cấp độ prompt.'
      ],
      detailedSummary: 'Bài tập 3 giúp em làm chủ kỹ năng Prompt Engineering. Bằng cách áp dụng các nguyên tắc nâng cao như gán vai trò, cung cấp ví dụ mẫu (Few-shot) và dẫn dắt tư duy (CoT), em đã giúp AI đưa ra cách giải thích Blockchain bằng ẩn dụ cuốn sổ lớp học cực kỳ trực quan và dễ nhớ.'
    },
    {
      id: 'bt4',
      coverImage: '/images/anh_4.jpg',
      label: 'Bài 4: Cộng tác đám mây & Kanban',
      fullName: 'Bài tập 4 — Cộng tác trực tuyến và điều phối dự án Thư viện Mini',
      objective: 'Ứng dụng các công cụ đám mây (Trello, Drive, Docs, Teams) để lên kế hoạch, phân công và phối hợp thực hiện dự án thiết kế hệ thống thư viện nhóm.',
      process: 'Cấu hình bảng Kanban trên Trello, thiết lập cấu trúc thư mục Google Drive đa tầng, cộng tác biên tập báo cáo phân tích hệ thống trên Google Docs qua chế độ Suggesting/Comment, phân tích và giải quyết các thách thức cộng tác.',
      product: 'Không gian cộng tác Kanban Trello, thư mục Drive nhóm và báo cáo phân tích thách thức.',
      fileUrl: '/files/Bai_4_ToBaoNhi.pdf',
      fileName: 'Bai_4_ToBaoNhi.pdf',
      fileType: 'pdf',
      skills: ['Kanban Trello', 'Google Workspace', 'Cộng tác đám mây', 'Version Control'],
      images: ['/images/steps/bt4/01.png', '/images/steps/bt4/02.png'],
      imageDescriptions: [
        'Ảnh 1: Quản trị tiến độ công việc nhóm trực quan trên bảng Kanban Trello.',
        'Ảnh 2: Cấu trúc thư mục đa cấp và quy tắc đặt tên file đồng nhất trên Google Drive.'
      ],
      detailedSummary: 'Bài tập 4 giúp em nâng cao kỹ năng làm việc nhóm trực tuyến. Em đã học cách tổ chức tài nguyên khoa học trên Drive, điều phối tác vụ qua Trello và giải quyết các xung đột dữ liệu thực tế bằng các công cụ cộng tác thời gian thực.'
    },
    {
      id: 'bt5',
      coverImage: '/images/anh_5.jpg',
      label: 'Bài 5: Sáng tạo nội dung số với AI',
      fullName: 'Bài tập 5 — Thiết kế ấn phẩm truyền thông Sống Xanh với AI',
      objective: 'Sử dụng các công cụ AI tạo sinh (Gemini, Canva, Nano Banana) để thiết kế bài viết blog và Infographic truyền thông về chiến dịch dấu chân carbon của AI và e-waste.',
      process: 'Gemini lên ý tưởng và dàn ý blog. Nano Banana tạo ảnh nghệ thuật không gian tương lai. Canva thiết kế Infographic với quy tắc tương phản và trọng lượng thị giác xanh lá đậm - trắng.',
      product: 'Bài viết blog "Sống Xanh trong Kỷ nguyên Số" và Infographic truyền thông Canva.',
      fileUrl: '/files/Bai_5_ToBaoNhi.pdf',
      fileName: 'Bai_5_ToBaoNhi.pdf',
      fileType: 'pdf',
      skills: ['Canva AI', 'Google Gemini', 'Generative Art', 'Truyền thông số'],
      images: ['/images/steps/bt5/01.jpeg', '/images/steps/bt5/02.jpeg'],
      imageDescriptions: [
        'Ảnh 1: Bản thiết kế Infographic Sống Xanh tối ưu hóa bố cục dọc trên Canva.',
        'Ảnh 2: Hình ảnh nghệ thuật không gian làm việc tương lai do AI Nano Banana tạo lập.'
      ],
      detailedSummary: 'Bài tập 5 giúp em làm chủ quy trình sáng tạo nội dung số. Sự phối hợp giữa AI tạo chữ (Gemini), tạo ảnh (Nano Banana) và công cụ thiết kế (Canva) đã giúp em tạo ra chiến dịch truyền thông Sống Xanh trực quan và có tính tác động cao.'
    },
    {
      id: 'bt6',
      coverImage: '/images/anh_6.jpg',
      label: 'Bài 6: Đạo đức AI & Liêm chính',
      fullName: 'Bài tập 6 — Sử dụng AI có trách nhiệm trong học tập thuật toán',
      objective: 'Nghiên cứu chính sách AI của VNU và xây dựng bộ nguyên tắc cá nhân sử dụng AI có trách nhiệm qua thực hành lập dàn ý thuật toán Quick Sort.',
      process: 'Đối chiếu chính sách AI của VNU, sử dụng ChatGPT hỗ trợ lập dàn ý thuyết trình Quick Sort trong C++, thực hiện kiểm chứng loại bỏ lỗi ảo giác, và đúc kết bộ 5 nguyên tắc vàng.',
      product: 'Báo cáo liêm chính học thuật và Bộ 5 nguyên tắc cá nhân về sử dụng AI.',
      fileUrl: '/files/Bai_6_ToBaoNhi.pdf',
      fileName: 'Bai_6_ToBaoNhi.pdf',
      fileType: 'pdf',
      skills: ['AI Ethics', 'Liêm chính học thuật', 'Quick Sort', 'Fact-checking AI'],
      images: [],
      imageDescriptions: [],
      detailedSummary: 'Bài tập 6 định hình tư duy sử dụng AI có trách nhiệm. Qua việc thực hành giải thuật Quick Sort, em hiểu rằng AI chỉ là công cụ bổ trợ, giá trị cốt lõi nằm ở tư duy độc lập và sự minh bạch, liêm chính của bản thân.'
    },
    {
      id: 'bt7',
      coverImage: '/images/anh_7.jpg',
      label: 'Bài 7: Tổng quan tài liệu bằng AI',
      fullName: 'Bài tập 7 — Tổng quan tài liệu pin Lithium-ion bằng Elicit & Consensus',
      objective: 'Ứng dụng các công cụ AI học thuật (Elicit, Consensus) để tự động trích xuất và tổng hợp thông tin từ 5 bài báo khoa học về cực anode Graphene.',
      process: 'Nhập truy vấn Boolean học thuật, sử dụng Elicit để trích xuất phương pháp và thông số, dùng Consensus đánh giá mức độ đồng thuận, lập bảng so sánh và viết nhận xét tổng hợp.',
      product: 'Báo cáo tổng quan tài liệu khoa học Graphene pin Lithium-ion và bảng so sánh trích xuất.',
      fileUrl: '/files/Bai_7_ToBaoNhi.pdf',
      fileName: 'Bai_7_ToBaoNhi.pdf',
      fileType: 'pdf',
      skills: ['Elicit AI', 'Consensus AI', 'Tổng hợp tài liệu', 'Pin Lithium-ion'],
      images: [],
      imageDescriptions: [],
      detailedSummary: 'Bài tập 7 giúp em tối ưu hóa thời gian nghiên cứu tài liệu khoa học. Các công cụ AI như Elicit và Consensus đã hỗ trợ đắc lực trong việc trích xuất tự động và tổng hợp chéo thông tin, giúp xây dựng báo cáo khoa học chính xác và chuyên sâu.'
    }
  ];

  const navigateToLesson = useCallback(
    (index: number, stepIndex: number | null = null) => {
      setActiveTab(index);
      setUrlLessonIndex(index);
      setViewMode('dashboard');
      setDeepLinkStep(stepIndex);
      setQuickNavOpen(false);
      setMenuOpen(false);
      setTimeout(() => scrollToDashboardSection(), 80);
    },
    [],
  );

  const handleSidebarProjectClick = (index: number) => {
    navigateToLesson(index);
  };

  useEffect(() => {
    const parsed = parsePortfolioUrl();
    if (parsed.lessonIndex != null) {
      setActiveTab(parsed.lessonIndex);
      setUrlLessonIndex(parsed.lessonIndex);
    }
    setViewMode(parsed.view);
    if (parsed.stepIndex != null) {
      setDeepLinkStep(parsed.stepIndex);
      setViewMode('dashboard');
    }
    setUrlSynced(true);
  }, []);

  useEffect(() => {
    const onPop = () => {
      const parsed = parsePortfolioUrl();
      if (parsed.lessonIndex != null) {
        setActiveTab(parsed.lessonIndex);
        setUrlLessonIndex(parsed.lessonIndex);
      } else {
        setUrlLessonIndex(null);
      }
      setViewMode(parsed.view);
      setDeepLinkStep(parsed.stepIndex);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!urlSynced) return;
    applyPortfolioUrl({
      lessonIndex: urlLessonIndex,
      view: viewMode,
      stepIndex: deepLinkStep,
    });
  }, [urlLessonIndex, viewMode, deepLinkStep, urlSynced]);

  useEffect(() => {
    if (!urlSynced || !scrollToLessonOnLoadRef.current) return;
    scrollToLessonOnLoadRef.current = false;
    if (urlLessonIndex != null && viewMode === 'dashboard') {
      setTimeout(() => scrollToDashboardSection(), 250);
    }
  }, [urlSynced, urlLessonIndex, viewMode]);

  useEffect(() => {
    const projectId = portfolioProjects[activeTab]?.id as keyof typeof stepEvidenceByProject;
    const stepImages = stepEvidenceByProject[projectId] ?? [];
    setExpandedSteps(getDefaultExpandedSteps(stepImages, deepLinkStep));
  }, [activeTab, deepLinkStep]);

  useEffect(() => {
    if (!urlSynced || deepLinkStep == null || viewMode !== 'dashboard') return;
    const t = window.setTimeout(() => {
      document.getElementById(`step-${deepLinkStep + 1}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 450);
    return () => clearTimeout(t);
  }, [deepLinkStep, activeTab, viewMode, urlSynced]);

  const copyLessonLink = async () => {
    try {
      await navigator.clipboard.writeText(
        getFullPortfolioUrl(activeTab, viewMode, deepLinkStep),
      );
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      /* clipboard blocked */
    }
  };

  const handleMainNavClick = (sectionId: string) => {
    setMenuOpen(false);
    if (sectionId === 'gioi-thieu' || sectionId === 'tong-ket' || sectionId === 'du-an') {
      setUrlLessonIndex(null);
      setDeepLinkStep(null);
    }
  };

  const jumpToStep = (stepIndex: number) => {
    setUrlLessonIndex((prev) => prev ?? activeTab);
    setDeepLinkStep(stepIndex);
    setExpandedSteps((prev) => new Set([...prev, stepIndex]));
    setQuickNavOpen(false);
    window.setTimeout(() => {
      document.getElementById(`step-${stepIndex + 1}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 150);
  };

  const toggleProcessStep = (stepIndex: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepIndex)) next.delete(stepIndex);
      else next.add(stepIndex);
      return next;
    });
  };

  const getBadgeStyleClass = (skillIndex: number) => {
    const classes = ['badge-pink', 'badge-purple', 'badge-violet', 'badge-purple', 'badge-rose', 'badge-emerald'];
    return `skill-badge ${classes[skillIndex % classes.length]}`;
  };

  const renderDetailedProcess = (tabIndex: number) => {
    const projectId = portfolioProjects[tabIndex].id as keyof typeof stepEvidenceByProject;
    const stepImages = stepEvidenceByProject[projectId] ?? [];
    const steps = LESSON_STEPS[tabIndex] ?? [];

    return (
      <div className="space-y-3 bg-pink-50/30 p-5 border border-pink-100/60 rounded-2xl print:bg-white print:border-slate-300">
        <p className="text-[10px] text-pink-600/70 font-semibold italic print:text-slate-700">
          Mở từng bước để xem mô tả chi tiết và minh chứng. Badge đánh dấu Prompt/AI, Human-in-the-loop và ảnh kết quả.
        </p>
        <ProcessStepAccordion
          lessonNumber={tabIndex + 1}
          steps={steps}
          stepImages={stepImages}
          expandedSteps={expandedSteps}
          onToggleStep={toggleProcessStep}
          onExpandStep={(idx) =>
            setExpandedSteps((prev) => new Set([...prev, idx]))
          }
          onImageClick={setSelectedImage}
        />
      </div>
    );
  };

  // ── 3-D Tilt Card effect: gentle perspective rotate on mouse-move ──
  const handleTiltMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -8;   // max ±8deg
    const rotY = ((x - cx) / cx) * 8;
    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    card.style.transition = 'transform 0.08s linear, box-shadow 0.3s ease';
  };

  const handleTiltLeave = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget as HTMLElement;
    card.style.transform = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease';
  };

  return (
    <div className="flex min-h-screen gradient-bg-elegant text-[#f472b6] relative overflow-hidden">
      {/* Custom interactive cursor — renders on top of everything */}
      <CustomCursor />
      {/* Fixed Background Image - Elegant, Lightweight & High Performance */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/images/anh_6.jpg" 
          alt="Tô Bảo Nhi - Background" 
          className="w-full h-full object-cover opacity-15 dark:opacity-8 filter saturate-50"
        />
        {/* Clean white overlay — blue-on-white theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-50/30 via-white/85 to-pink-50/20 dark:from-[#0f0308]/90 dark:via-[#0c0206]/95 dark:to-[#0f0308]/90" />
      </div>

      {/* 1. Desktop Persistent Left Sidebar Navigation */}
      <aside className="hidden xl:flex flex-col w-[280px] bg-white/95 dark:bg-[#071530]/95 border-r-[2.5px] border-[#f472b6]/20 dark:border-[#60a5fa]/20 h-screen sticky top-0 pt-8 pb-0 justify-between shrink-0 z-30 shadow-[6px_0_0_0_rgba(30,64,175,0.06)] backdrop-blur-md">
        <div className="flex flex-col">
          {/* Sidebar Header Brand Logo */}
          <div className="px-6 pb-6 border-b-[2.5px] border-[#f472b6]/15 dark:border-[#60a5fa]/15">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-[#f472b6] flex items-center justify-center text-white font-extrabold shadow-md shadow-pink-300/30">
                DS
              </span>
              <span className="text-[#f472b6] dark:text-pink-200 text-base font-extrabold tracking-tight block font-sans">
                PORTFOLIO SỐ
              </span>
            </div>
            <span className="text-xs font-bold text-[#f472b6] dark:text-pink-400 uppercase tracking-widest block pl-0.5">
              Tô Bảo Nhi
            </span>
            <span className="text-[10px] text-[#f472b6]/60 dark:text-pink-300/70 font-semibold block mt-1 pl-0.5">
              Sinh viên lớp VNU1001-E252036 • VNU-HSB
            </span>
          </div>

          {/* Sidebar Navigation Tree */}
          <nav className="mt-6 flex flex-col gap-1 px-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => handleMainNavClick(link.id)}
                className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all dark:text-pink-200 dark:hover:text-white ${
                  currentSection === link.id ? 'active dark:!text-pink-300 dark:!bg-pink-950/60 dark:!border-pink-400' : ''
                }`}
              >
                {link.id === 'gioi-thieu' && <GraduationCap className="w-4.5 h-4.5 text-[#f472b6] dark:text-pink-400" />}
                {link.id === 'du-an' && <FileText className="w-4.5 h-4.5 text-[#f472b6] dark:text-pink-400" />}
                {link.id === 'tong-ket' && <BookOpen className="w-4.5 h-4.5 text-[#f472b6] dark:text-pink-400" />}
                {link.label}
              </a>
            ))}

            {/* Nested Project Structure inside sidebar */}
            <div className="mt-4 pl-3 border-l-2 border-[#fce7f3] dark:border-pink-900/50 ml-6 flex flex-col gap-1.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#f472b6]/40 dark:text-pink-400/60 block py-1 px-2">
                Bài tập thực hành
              </span>
              {portfolioProjects.map((proj, idx) => (
                <button
                  key={proj.id}
                  onClick={() => handleSidebarProjectClick(idx)}
                  className={`text-left text-xs font-semibold py-2 px-2.5 rounded-lg transition-all ${
                    activeTab === idx 
                    ? 'text-[#f472b6] dark:text-pink-200 bg-[#fce7f3]/50 dark:bg-pink-950/60 font-extrabold border-r-2 border-[#f472b6] shadow-sm' 
                    : 'text-[#f472b6]/60 dark:text-pink-400 hover:text-[#f472b6] dark:hover:text-pink-200 hover:bg-[#fff5f9] dark:hover:bg-pink-900/30'
                  }`}
                >
                  Bài {idx + 1}: {proj.label.split(':')[1]?.trim() || proj.label}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Sidebar Footer Details */}
        <div className="w-full px-6 py-5 border-t border-[#f472b6]/15 dark:border-pink-900/50 text-[11px] text-[#f472b6]/60 dark:text-pink-400 space-y-2 bg-[#fff5f9]/25 dark:bg-pink-950/10 mt-auto">
          <p className="font-extrabold text-[#f472b6] dark:text-pink-300 tracking-wide uppercase text-[9px]">Liên hệ hỗ trợ:</p>
          <div className="flex items-center gap-2 text-[#f472b6] dark:text-pink-300">
            <Mail className="w-3.5 h-3.5 text-[#f472b6] shrink-0" />
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=25080147@vnu.edu.vn" target="_blank" rel="noopener noreferrer" className="truncate font-bold text-[#f472b6] dark:text-pink-400 hover:underline">
              25080147@vnu.edu.vn
            </a>
          </div>
        </div>
      </aside>

      {/* Main Right Scrollable Layout */}
      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* 2. Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white/92 dark:bg-[#071530]/95 backdrop-blur-md border-b-[2.5px] border-[#f472b6]/15 dark:border-[#60a5fa]/15 px-4 sm:px-6 py-4 flex items-center justify-between xl:justify-end">
          <div className="flex items-center gap-2 xl:hidden">
            <span className="w-7 h-7 rounded-lg bg-[#f472b6] flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-pink-300/20">
              DS
            </span>
            <span className="text-[#f472b6] dark:text-pink-200 font-extrabold text-sm sm:text-base tracking-tight font-sans">
              PORTFOLIO • Tô Bảo Nhi
            </span>
          </div>

          {/* Top menu for screens < 1280px */}
          <div className="hidden lg:flex xl:hidden items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => handleMainNavClick(link.id)}
                className={`nav-top-link text-xs sm:text-sm font-bold py-1 transition-all ${
                  currentSection === link.id ? 'active' : ''
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('https://mail.google.com/mail/?view=cm&fs=1&to=25080147@vnu.edu.vn', '_blank')}
              className="hidden sm:flex rounded-xl text-xs active:scale-95"
            >
              <Mail className="w-3.5 h-3.5" /> Gửi VNU Gmail
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode((v) => !v)}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#fff5f9] dark:bg-pink-900/60 text-[#f472b6] dark:text-pink-300 hover:bg-[#fce7f3] dark:hover:bg-pink-900 transition-colors cursor-pointer"
              aria-label={darkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
              title={darkMode ? 'Giao diện sáng' : 'Giao diện tối'}
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Mobile Hamburger menu toggle */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="xl:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-[#fff5f9] dark:bg-pink-900/60 text-[#f472b6] dark:text-pink-200 hover:bg-[#fce7f3] dark:hover:bg-pink-900 transition-colors cursor-pointer"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </header>

        {/* Mobile menu drawer overlay */}
        {menuOpen && (
          <div
            className="xl:hidden fixed inset-0 z-40 bg-[#f472b6]/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Mobile menu drawer */}
        <div
          className={`xl:hidden fixed top-0 right-0 bottom-0 z-50 w-[80%] max-w-xs bg-white dark:bg-[#071530] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full pt-16 px-6 pb-6">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#fce7f3] dark:border-pink-900">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#f472b6] flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                  DS
                </span>
                <span className="text-[#f472b6] dark:text-pink-200 font-extrabold text-sm">PORTFOLIO</span>
              </div>
              <button 
                onClick={() => setMenuOpen(false)} 
                className="w-8 h-8 rounded-full bg-[#fff5f9] dark:bg-pink-900/60 flex items-center justify-center text-[#f472b6] dark:text-pink-300"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <nav className="mt-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => handleMainNavClick(link.id)}
                  className={`text-sm font-bold text-[#f472b6] dark:text-pink-200 py-3 border-b border-[#fce7f3]/60 dark:border-pink-900/50 flex items-center gap-2 ${
                    currentSection === link.id ? 'text-[#f472b6] dark:text-pink-400 border-b-2 border-[#f472b6]/40' : ''
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 mt-2 border-t-2 border-[#fce7f3]/40">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#f472b6]/50 dark:text-sky-500 block mb-2 px-1">
                  7 bài tập
                </span>
                {portfolioProjects.map((proj, idx) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => navigateToLesson(idx)}
                    className={`w-full text-left text-xs font-bold py-2.5 px-2 rounded-lg mb-1 cursor-pointer ${
                      activeTab === idx ? 'bg-[#fff5f9] dark:bg-pink-950/60 text-[#f472b6] dark:text-pink-300' : 'text-[#f472b6]/70 dark:text-pink-300 hover:bg-[#fff5f9] dark:hover:bg-pink-900/40'
                    }`}
                  >
                    #bai-{idx + 1} · {proj.label.split(':')[0]}
                  </button>
                ))}
              </div>
            </nav>

            <div className="mt-auto pt-6 border-t-2 border-[#fce7f3]/40 dark:border-pink-900 text-xs text-[#f472b6]/60 dark:text-pink-400 space-y-2 bg-[#fff5f9]/20 dark:bg-pink-950/20 p-4 rounded-xl">
              <p className="font-extrabold text-[#f472b6] dark:text-pink-300 text-xs uppercase tracking-wide">Tô Bảo Nhi</p>
              <p className="font-semibold text-[#f472b6] dark:text-pink-300">Trường Quản trị và Kinh doanh, ĐHQGHN</p>
              <p className="text-[#f472b6] dark:text-pink-400 font-bold truncate">Gmail: 25080147@vnu.edu.vn</p>
            </div>
          </div>
        </div>

        {/* 3. Header Banner */}
        <section className="relative h-[260px] sm:h-[320px] md:h-[360px] w-full overflow-hidden flex items-center justify-center dark-gradient-banner">
          {/* Static nature background inside header banner */}
          <img 
            src="/images/anh_6.jpg" 
            alt="Tô Bảo Nhi - VNU Hanoi School of Business and Management" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Deep blue semi-transparent banner overlay */}
          <div className="absolute inset-0 bg-[#f472b6]/70 z-10" />

          {/* Banner Contents */}
          <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl">
            <p className="text-[#fce7f3] text-[13px] sm:text-[16px] md:text-[18px] font-bold tracking-widest uppercase drop-shadow-md font-sans">
              Hành Trình Trải Nghiệm &amp; Kỹ Năng Số Học Thuật
            </p>
            
            {/* The main title */}
            <h1 className="banner-name text-white mt-3 drop-shadow-lg tracking-tight text-center">
              Tô Bảo Nhi
            </h1>

            <p className="text-[#fce7f3] text-xs sm:text-sm md:text-base mt-3 max-w-2xl mx-auto font-semibold drop-shadow-sm">
              Sinh viên lớp VNU1001-E252036 • VNU Hanoi School of Business and Management
            </p>

            {/* Highlight Accent Line below title */}
            <div className="mt-5 bg-[#fce7f3] h-2 w-32 mx-auto rounded-none shadow-lg shadow-pink-300/30" />
          </div>
        </section>

        {/* 4. Page: Lời mở đầu (Giới thiệu) */}
        <section id="gioi-thieu" className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 max-w-5xl mx-auto w-full relative">
          <div className="text-center mb-12">
            <h3 className="academic-section-title uppercase">
              Lời Mở Đầu
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:items-center items-start relative z-10">
            {/* Left side: Profile Card */}
            <div className="md:col-span-4">
              <PortfolioIntroMedia />
            </div>

            {/* Right side: Welcome & Goals */}
            <div className="md:col-span-8 space-y-6">
              {/* Welcome Card — scroll highlight */}
              <ScrollHighlightSection defaultActive={true} className="glass-panel dark:bg-[#071530]/80 p-6 sm:p-8 rounded-3xl space-y-4">
                <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed text-justify font-medium">
                  Bước vào kỷ nguyên chuyển đổi số dưới sự định hình của <strong className="text-[#f472b6] dark:text-white">Cuộc cách mạng Công nghiệp lần thứ tư</strong>, công nghệ hiện đại đã trở thành nền tảng cốt lõi chi phối và tối ưu hóa mọi hoạt động của đời sống. Là một sinh viên theo đuổi lĩnh vực <strong className="text-[#f472b6] dark:text-white">Hệ thống thông tin</strong>, tôi luôn ý thức được vai trò của việc chủ động làm chủ kỹ thuật và áp dụng các giải pháp tiên tiến một cách có trách nhiệm.
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed text-justify font-medium">
                  Tập hồ sơ năng lực này chính là tấm gương phản chiếu hành trình hoàn thiện tư duy của tôi qua từng dự án thực chiến. Đi từ những kỹ năng quản trị tệp tin căn bản, phương pháp điều phối và quản lý tiến độ nhóm trực tuyến, cho đến việc tối ưu hóa tư duy tương tác AI (<strong className="text-[#f472b6] dark:text-white">Prompt Engineering</strong>) phục vụ nghiên cứu chuyên sâu, toàn bộ các nội dung được trình bày sẽ minh chứng cho khả năng kết hợp hài hòa giữa nền tảng lý thuyết và kỹ năng thực hành để giải quyết những bài toán thực tế.
                </p>
              </ScrollHighlightSection>

              {/* Goal Card — scroll highlight */}
              <ScrollHighlightSection className="p-5 bg-[#fff5f9] dark:bg-pink-950/40 border-2 border-[#fce7f3] dark:border-pink-900/30 rounded-2xl space-y-2">
                <span className="text-xs font-black text-[#f472b6] dark:text-pink-300 uppercase tracking-widest block font-sans">
                  Mục Tiêu Portfolio
                </span>
                <p className="text-xs sm:text-sm text-[#f472b6]/80 dark:text-pink-300 leading-relaxed font-semibold text-justify">
                  Hồ sơ năng lực này được xây dựng với mục đích hệ thống hóa một cách khoa học các kỹ năng chuyên môn từ lập trình, quản lý hệ thống đến năng lực điều hành dự án mà tôi đã tích lũy. Thông qua việc chuẩn hóa quy trình làm việc và áp dụng tư duy trực quan, tôi hướng đến việc xây dựng một phong cách làm việc chuyên nghiệp, nhất quán và có tính tổ chức cao. Đồng thời, đây cũng là nền tảng để khẳng định tinh thần tự học, sự nhạy bén trước các làn sóng công nghệ mới và cam kết tuân thủ nghiêm túc các chuẩn mực đạo đức trong môi trường học thuật lẫn công việc.
                </p>
              </ScrollHighlightSection>
            </div>
          </div>

          {/* Academic Focus Cards & Portfolio Checklist centering under row 1 */}
          <div className="relative z-10 mt-8 space-y-6">
            {/* Row/Grid of Academic Focus Cards — tilt interaction */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Profile Card 1 */}
              <div
                className="glass-panel hover-lift rounded-2xl p-5 dark:bg-[#071530]/70 shadow-sm flex flex-col justify-center items-center text-center gap-2.5 min-h-[180px]"
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
              >
                <div className="flex items-center gap-2 text-[#f472b6] dark:text-pink-300 font-extrabold text-xs font-sans uppercase tracking-wide">
                  <GraduationCap className="w-4 h-4 text-[#f472b6] dark:text-pink-400 shrink-0" />
                  Chuyên ngành
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                  <strong className="text-[#f472b6] dark:text-white">Tô Bảo Nhi</strong>, sinh viên thuộc khối ngành Marketing và Truyền thông , hệ thống thông tin (Lớp VNU1001-E252036). Trường Quản trị và Kinh doanh, Đại học Quốc gia Hà Nội (VNU-HSB).
                </p>
              </div>

              {/* Profile Card 2 */}
              <div
                className="glass-panel hover-lift rounded-2xl p-5 dark:bg-[#071530]/70 shadow-sm flex flex-col justify-center items-center text-center gap-2.5 min-h-[180px]"
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
              >
                <div className="flex items-center gap-2 text-[#f472b6] dark:text-pink-300 font-extrabold text-xs font-sans uppercase tracking-wide">
                  <Layers className="w-4 h-4 text-[#f472b6] dark:text-pink-400 shrink-0" />
                  Lĩnh vực quan tâm
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                  Định hướng nghiên cứu của tôi tập trung vào việc ứng dụng các mô hình học máy trong tự động hóa và bảo trì dự đoán nhằm nâng cao hiệu suất công nghiệp. Bên cạnh đó, tôi dành sự quan tâm lớn cho kỹ nghệ tương tác AI (Prompt Engineering) cùng việc khai thác trí tuệ nhân tạo tạo sinh để xử lý dữ liệu, hỗ trợ tìm kiếm giải pháp đột phá trong ngành khoa học vật liệu và năng lượng xanh.
                </p>
              </div>

              {/* Profile Card 3 */}
              <div
                className="glass-panel hover-lift rounded-2xl p-5 dark:bg-[#071530]/70 shadow-sm flex flex-col justify-between"
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
              >
                <div className="flex items-center gap-2 text-[#f472b6] dark:text-pink-300 font-extrabold text-xs mb-2 font-sans uppercase tracking-wide">
                  <CheckSquare className="w-4 h-4 text-[#f472b6] dark:text-pink-400 shrink-0" />
                  Kỹ năng cốt lõi
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold text-justify">
                  Tôi sở hữu nền tảng năng lực toàn diện gồm kỹ năng chuyên môn sâu và tư duy quản lý linh hoạt. Về mặt kỹ thuật, tôi có khả năng quản trị hệ điều hành Windows, tối ưu hóa các giải thuật trên ngôn ngữ C++ và vận dụng thành thạo các kỹ thuật viết prompt nâng cao nhằm khai thác hiệu quả các công cụ GenAI (Elicit, Consensus, ChatGPT, Gemini) phục vụ nghiên cứu khoa học. Về kỹ năng bổ trợ, tôi làm chủ phương pháp điều phối dự án theo mô hình Agile/Kanban trên nền tảng Trello, có năng lực làm việc cộng tác từ xa và tư duy tốt về mặt truyền thông thị giác trong thiết kế sản phẩm.
                </p>
              </div>
            </div>

            {/* Portfolio Rubric Checklist */}
            <RubricChecklist variant="portfolio" />
          </div>
        </section>

        {/* 5. Page: Bài tập thực hành (Dự án) */}
        <section id="du-an" className="py-16 sm:py-20 px-4 sm:px-8 md:px-12 bg-transparent relative z-10">
          <div className="max-w-5xl mx-auto w-full">
            <div className="text-center mb-12">
              <h3 className="academic-section-title uppercase">
                Bài Tập Thực Hành
              </h3>
              <p className="text-xs sm:text-sm text-[#f472b6]/70 dark:text-pink-300 max-w-2xl mx-auto mt-3 font-semibold font-sans">
                Hệ thống 7 bài tập lớn rèn luyện năng lực số chuẩn công nghệ số được thực hiện chi tiết theo quy trình nghiên cứu học thuật.
              </p>
            </div>

            {/* Rubric Progress Map (8 items) */}
            <div className="mb-8">
              <RubricProgressMap onGoToLesson={navigateToLesson} />
            </div>

            {/* View Mode Switcher */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/90 dark:bg-[#071530]/80 backdrop-blur-md p-1.5 rounded-xl border-2 border-[#fce7f3] dark:border-pink-900 inline-flex items-center gap-1.5 shadow-sm">
                <button
                  onClick={() => {
                    setViewMode('gallery');
                    setDeepLinkStep(null);
                  }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                    viewMode === 'gallery'
                      ? 'bg-[#f472b6] text-white shadow-sm'
                      : 'text-[#f472b6] hover:text-[#db2777] hover:bg-[#fff5f9] dark:text-pink-300 dark:hover:bg-pink-900/40',
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Chế độ Gallery (Notion)
                </button>
                <button
                  onClick={() => {
                    setViewMode('dashboard');
                    setTimeout(() => scrollToDashboardSection(), 100);
                  }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                    viewMode === 'dashboard'
                      ? 'bg-[#f472b6] text-white shadow-sm'
                      : 'text-[#f472b6] hover:text-[#db2777] hover:bg-[#fff5f9] dark:text-pink-300 dark:hover:bg-pink-900/40',
                  )}
                >
                  <Columns className="w-4 h-4" />
                  Chế độ Dashboard (Phân tích)
                </button>
              </div>
            </div>

            {viewMode === 'gallery' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioProjects.map((proj, idx) => (
                  <Card
                    key={proj.id}
                    className="gallery-tilt-card hover-lift overflow-hidden flex flex-col justify-between h-full rounded-xl border-[#fce7f3] shadow-sm hover:border-[#f472b6]/40 transition-all duration-300"
                    onMouseMove={handleTiltMove}
                    onMouseLeave={handleTiltLeave}
                  >
                    <div>
                      {/* Cover Image */}
                      <div className="h-44 w-full overflow-hidden bg-[#fff5f9] relative group border-b border-[#fce7f3]/30">
                        <img
                          src={proj.coverImage}
                          alt={proj.label}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center rounded-md border-2 border-[#f472b6] bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#f472b6] shadow-sm">
                            Bài {idx + 1}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <CardContent className="pt-5 space-y-3">
                        <CardTitle className="text-[#f472b6] dark:text-slate-100 line-clamp-2">
                          {proj.fullName}
                        </CardTitle>
                        
                        {/* Skills badges */}
                        <div className="flex flex-wrap gap-1">
                          {proj.skills.slice(0, 3).map((skill, sIdx) => (
                            <Badge key={sIdx} variant={sIdx % 2 === 0 ? 'default' : 'teal'} className="text-[9px] px-2 py-0.5">
                              {skill}
                            </Badge>
                          ))}
                          {proj.skills.length > 3 && (
                            <Badge variant="secondary" className="text-[9px] px-2 py-0.5">
                              +{proj.skills.length - 3}
                            </Badge>
                          )}
                        </div>

                        <ScrollHighlightSection threshold={0.15} rootMargin="-5% 0px -5% 0px">
                          <p className="text-slate-600 text-xs leading-relaxed text-justify line-clamp-3 font-semibold">
                            {proj.objective}
                          </p>
                        </ScrollHighlightSection>
                      </CardContent>
                    </div>

                    {/* Card Actions */}
                    <CardFooter className="px-5 pb-5 pt-3 border-t-2 border-[#fce7f3]/50 flex items-center justify-between gap-3 bg-[#fff5f9]/30">
                      <Button
                        onClick={() => navigateToLesson(idx)}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="px-2 text-xs text-[#f472b6] hover:text-[#db2777]"
                        data-cursor-label="Xem"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                      </Button>
                      
                      {proj.fileUrl && (
                        <a
                          href={proj.fileUrl}
                          download={proj.fileName}
                          className="text-[10px] uppercase font-bold text-[#f472b6] hover:text-[#f472b6] transition-colors flex items-center gap-1 font-sans"
                        >
                          <FileDown className="w-3.5 h-3.5" /> Tải báo cáo
                        </a>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div id="dashboard-view-container" className="scroll-mt-24 glass-panel rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[580px]">
                {/* Left Selector Sidebar */}
                <div className="w-full md:w-[260px] bg-[#fff5f9]/50 dark:bg-[#071530]/60 border-r-2 border-[#fce7f3] dark:border-pink-900/40 flex flex-col shrink-0">
                  <div className="p-5 border-b-2 border-[#fce7f3] dark:border-pink-900/40 bg-[#fff5f9]/60 dark:bg-[#071530]/40">
                    <span className="text-xs font-black text-[#f472b6] dark:text-pink-200 uppercase tracking-widest block font-sans">
                      Danh Sách Bài Học
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col p-3 gap-2">
                    {portfolioProjects.map((proj, idx) => (
                      <button
                        key={proj.id}
                        onClick={() => handleSidebarProjectClick(idx)}
                        className={cn('text-left w-full md:shrink flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-bold transition-colors active:scale-[0.98]',
                          activeTab === idx
                            ? 'bg-[#f472b6] text-white shadow-sm'
                            : 'text-[#f472b6] hover:text-[#db2777] hover:bg-white bg-white/50 dark:bg-transparent dark:text-pink-300 dark:hover:bg-pink-900/30'
                        )}
                      >
                        <span className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                          activeTab === idx ? 'bg-white text-[#f472b6]' : 'bg-[#fce7f3] text-[#f472b6]'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="truncate font-sans">{proj.label.split(':')[0]}</span>
                        <ChevronRight className={`w-4 h-4 ml-auto hidden md:block ${
                          activeTab === idx ? 'opacity-100' : 'opacity-30'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Detail Pane */}
                <div 
                  id="dashboard-detail-pane"
                  className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white dark:bg-[#030d1a] relative md:max-h-[720px] overflow-y-auto custom-scrollbar"
                >
                  <div key={activeTab} id="lesson-print-area" className="space-y-6 animate-focus-zoom print:animate-none">
                    {/* Title of exercise */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b-2 border-[#fce7f3]/50">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] uppercase font-black text-[#f472b6] bg-[#fff5f9] px-2.5 py-1 rounded-full tracking-widest font-sans border-2 border-[#fce7f3]">
                            Bài Tập Số {activeTab + 1}
                          </span>
                          <span className="text-[9px] uppercase font-black text-[#f472b6] bg-pink-50 px-2.5 py-1 rounded-full tracking-widest font-sans border-2 border-[#fce7f3]">
                            Giáo Trình VNU-HSB
                          </span>
                          <span className="no-print text-[9px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/80">
                            #bai-{activeTab + 1}
                            {deepLinkStep != null ? `-step-${deepLinkStep + 1}` : ''}
                          </span>
                        </div>
                        <p className="text-[#f472b6] dark:text-pink-100 text-xl sm:text-2xl font-black font-sans leading-tight">
                          {portfolioProjects[activeTab].fullName}
                        </p>
                      </div>
                      

                    </div>

                    <LessonMiniToc
                      lessonNumber={activeTab + 1}
                      steps={LESSON_STEPS[activeTab] ?? []}
                      onJumpToStep={jumpToStep}
                    />

                    {/* Core skills badges */}
                    {portfolioProjects[activeTab].skills && (
                      <div className="flex flex-wrap gap-2 pt-1 border-b-2 border-[#fce7f3]/40 pb-4">
                        {portfolioProjects[activeTab].skills.map((skill, skillIdx) => (
                          <span key={skillIdx} className={getBadgeStyleClass(skillIdx)}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Objective (Mục tiêu) */}
                    <div className="space-y-2">
                      <h5 className="text-[#f472b6] text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 font-sans">
                        <span className="w-1.5 h-3 bg-[#f472b6] rounded-none inline-block" />
                        Mục tiêu bài tập
                      </h5>
                      <ScrollHighlightSection threshold={0.2} rootMargin="-5% 0px -5% 0px">
                        <p className="text-slate-700 text-xs sm:text-sm leading-relaxed text-justify font-medium">
                          {portfolioProjects[activeTab].objective}
                        </p>
                      </ScrollHighlightSection>
                    </div>

                    {/* Detailed Summary */}
                    {portfolioProjects[activeTab].detailedSummary && (
                      <div className="space-y-2 bg-[#fff5f9]/60 p-5 border-l-4 border-[#f472b6] rounded-r-2xl">
                        <h5 className="text-[#f472b6] text-xs sm:text-sm font-extrabold uppercase tracking-widest font-sans">
                          Tóm tắt quá trình thực hiện
                        </h5>
                        <ScrollHighlightSection threshold={0.2} rootMargin="-5% 0px -5% 0px">
                          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed text-justify italic font-semibold">
                            "{portfolioProjects[activeTab].detailedSummary}"
                          </p>
                        </ScrollHighlightSection>
                      </div>
                    )}

                    {/* Implementation Process */}
                    <div className="space-y-2">
                      <h5 className="text-[#f472b6] text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 font-sans">
                        <span className="w-1.5 h-3 bg-[#f472b6] rounded-none inline-block" />
                        Quy trình thực hiện chi tiết
                      </h5>
                      {renderDetailedProcess(activeTab)}
                    </div>

                    {/* Rubric Supplements (for video embed in Bài 4 etc) */}
                    <div className="space-y-2 pt-4 border-t border-dashed border-slate-200/80 dark:border-slate-800/80">
                      <LessonRubricSupplements tabIndex={activeTab} />
                    </div>

                    {/* Rubric Checklist for current Lesson */}
                    <div className="space-y-2 pt-4 border-t border-dashed border-slate-200/80 dark:border-slate-800/80">
                      <RubricChecklist
                        variant="lesson"
                        lessonIndex={activeTab}
                        lessonLabel={portfolioProjects[activeTab].label}
                      />
                    </div>
                  </div>

                  {/* Previous & Next navigation */}
                  <div className="mt-8 pt-6 border-t-2 border-[#fce7f3]/40 flex items-center justify-between gap-4 w-full flex-wrap sm:flex-nowrap">
                    {activeTab > 0 ? (
                      <button
                        onClick={() => navigateToLesson(activeTab - 1)}
                        className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-[#fff5f9] hover:bg-[#fce7f3] text-[#f472b6] font-bold text-xs transition-all border-2 border-[#fce7f3] cursor-pointer active:scale-95 text-left max-w-full sm:max-w-[48%] w-full sm:w-auto"
                      >
                        <ChevronRight className="w-4.5 h-4.5 rotate-180 shrink-0 text-[#f472b6] animate-pulse" />
                        <div className="truncate">
                          <span className="text-[9px] uppercase block tracking-widest text-[#f472b6]/50 font-black">Bài trước đó</span>
                          Bài {activeTab}: {portfolioProjects[activeTab - 1].label.split(':')[1]?.trim() || portfolioProjects[activeTab - 1].label}
                        </div>
                      </button>
                    ) : (
                      <div className="hidden sm:block" />
                    )}

                    {activeTab < 5 && (
                      <button
                        onClick={() => navigateToLesson(activeTab + 1)}
                        className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-[#f472b6] hover:bg-[#db2777] text-white font-bold text-xs transition-all border-2 border-[#f472b6] cursor-pointer active:scale-95 text-left max-w-full sm:max-w-[48%] w-full sm:w-auto ml-auto shadow-md shadow-pink-300/30"
                      >
                        <div className="truncate flex-1">
                          <span className="text-[9px] uppercase block tracking-widest text-[#fce7f3] font-black">Bài tiếp theo</span>
                          Bài {activeTab + 2}: {portfolioProjects[activeTab + 1].label.split(':')[1]?.trim() || portfolioProjects[activeTab + 1].label}
                        </div>
                        <ChevronRight className="w-4.5 h-4.5 shrink-0 text-white/90 animate-pulse" />
                      </button>
                    )}
                  </div>

                  {/* Call-to-action details */}
                  <div className="mt-8 pt-6 border-t-2 border-[#fce7f3]/40 flex items-center justify-between flex-wrap gap-5 w-full">
                    <span className="text-[11px] text-[#f472b6]/40 font-bold md:max-w-[40%] leading-relaxed">
                      * Mọi báo cáo và hình ảnh đều được trích dẫn trực tiếp từ sản phẩm gốc của sinh viên Tô Bảo Nhi.
                    </span>
                    
                    <div className="no-print flex items-center gap-3 flex-wrap sm:flex-nowrap">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="outline-button text-[#f472b6] text-xs sm:text-sm font-bold px-5 py-3.5 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Printer className="w-4.5 h-4.5 text-[#f472b6] shrink-0" />
                        In / Xuất PDF
                      </button>

                      {portfolioProjects[activeTab].fileUrl && (
                        <a
                          href={portfolioProjects[activeTab].fileUrl}
                          download={portfolioProjects[activeTab].fileName}
                          className="gradient-button text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer shadow-md"
                        >
                          <FileDown className="w-4.5 h-4.5 shrink-0" /> Tải xuống báo cáo (.{portfolioProjects[activeTab].fileType})
                        </a>
                      )}

                      <button
                        onClick={() =>
                          window.open(
                            `https://mail.google.com/mail/?view=cm&fs=1&to=25080147@vnu.edu.vn&su=Trao đổi về: ${portfolioProjects[activeTab].label}`,
                            '_blank'
                          )
                        }
                        className="outline-button text-[#f472b6] text-xs sm:text-sm font-bold px-5 py-3.5 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Mail className="w-4.5 h-4.5 text-[#f472b6] shrink-0" /> Liên hệ VNU Gmail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 6. Page: Tổng kết & Suy ngẫm */}
        <section id="tong-ket" className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 max-w-5xl mx-auto w-full relative z-10">
          <div className="text-center mb-12">
            <h3 className="academic-section-title uppercase">
              Tổng Kết & Suy Ngẫm
            </h3>
            <p className="text-xs sm:text-sm text-[#f472b6]/60 max-w-xl mx-auto mt-3 font-semibold font-sans">
              Đúc kết chặng đường rèn luyện và xây dựng tư duy "Nhà quản trị số" vững vàng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Column 1: Lessons per assignment */}
            <ScrollHighlightSection threshold={0.15} rootMargin="-5% 0px -5% 0px" className="glass-panel hover-lift rounded-2xl p-6 space-y-4 flex flex-col">
              <div className="flex items-center gap-3 text-[#f472b6] dark:text-pink-200 font-extrabold text-sm border-b-2 border-[#fce7f3] dark:border-pink-900/40 pb-3 font-sans">
                <span className="w-8 h-8 rounded-xl bg-[#fff5f9] dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-[#f472b6] dark:text-pink-400" />
                </span>
                Kiến Thức Tích Luỹ
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify font-medium">
                Hành trình học tập thực chiến đã mang lại cho tôi hệ thống kiến thức đa chiều và vững chắc. Tôi nắm rõ các nguyên lý điện toán căn bản về lưu trữ, bảo mật dữ liệu cục bộ và tổ chức không gian làm việc số. Trên phương diện thuật toán, tôi hiểu sâu sắc logic cấu trúc đồ thị thông qua thuật toán Dijkstra để ứng dụng vào các bài toán định tuyến thực tế. Đồng thời, tôi đã trang bị nền tảng về công nghệ Blockchain với các cơ chế đồng thuận và mã băm bảo mật, song song với việc chuẩn hóa tư duy về các cấp độ bảo trì công nghiệp, đặc biệt là mô hình bảo trì dự đoán thông minh dựa trên dữ liệu cảm biến IoT.
              </p>
            </ScrollHighlightSection>

            {/* Column 2: Self growth */}
            <ScrollHighlightSection threshold={0.15} rootMargin="-5% 0px -5% 0px" className="glass-panel hover-lift rounded-2xl p-6 space-y-4 flex flex-col justify-start">
              <div className="flex items-center gap-3 text-[#f472b6] dark:text-pink-200 font-extrabold text-sm border-b-2 border-[#fce7f3] dark:border-pink-900/40 pb-3 font-sans">
                <span className="w-8 h-8 rounded-xl bg-[#fff5f9] dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-[#f472b6] dark:text-pink-400" />
                </span>
                Sự Phát Triển Bản Thân
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify font-medium">
                Sự chuyển biến lớn nhất của tôi sau quá trình thực hành chính là sự thay đổi tư duy từ một người ứng dụng công nghệ đơn thuần sang vai trò làm chủ công nghệ. Thay vì tin tưởng một cách thụ động, tôi áp dụng mô hình tương tác có sự kiểm soát của con người, đặt AI vào vị trí trợ lý hỗ trợ xây dựng khung ý tưởng, tìm lỗi mã nguồn và tinh gọn cấu trúc nội dung, trong khi bản thân giữ quyền tối cao trong việc thẩm định và đưa ra quyết định chuyên môn.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify font-medium">
                Sự trưởng thành này còn đi liền với việc thực hành nghiêm túc năm nguyên tắc đạo đức sử dụng AI trong học thuật, bao gồm tính chủ động, tính minh bạch, kiểm chứng chống ảo giác, bảo mật thông tin và quyền làm chủ tuyệt đối đối với sản phẩm cuối cùng.
              </p>
            </ScrollHighlightSection>

            {/* Column 3: Challenges & Resolution */}
            <ScrollHighlightSection threshold={0.15} rootMargin="-5% 0px -5% 0px" className="glass-panel hover-lift rounded-2xl p-6 space-y-4 flex flex-col justify-start">
              <div className="flex items-center gap-3 text-[#f472b6] dark:text-pink-200 font-extrabold text-sm border-b-2 border-[#fce7f3] dark:border-pink-900/40 pb-3 font-sans">
                <span className="w-8 h-8 rounded-xl bg-[#fff5f9] dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[#f472b6] dark:text-pink-400" />
                </span>
                Thách Thức & Giải Pháp
              </div>
              <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                <p className="text-justify">
                  Trong quá trình hoàn thành chuỗi bài tập thực hành, tôi đã chủ động vượt qua ba rào cản lớn nhờ những giải pháp mang tính hệ thống. Đầu tiên, để đối phó với hiện tượng thông tin sai lệch và ảo giác của AI khi truy vấn thuật toán hoặc trích xuất tài liệu chuyên sâu, tôi sử dụng kỹ thuật Prompt chuỗi tư duy nhằm định hướng luồng suy luận của AI, kết hợp chặt chẽ việc chạy thử nghiệm code và đối chiếu trực tiếp với giáo trình hoặc các bài báo khoa học uy tín thuộc danh mục ISI/Scopus.
                </p>
                <p className="text-justify">
                  Tiếp theo, nhằm giải quyết tình trạng quá tải thông tin và nguy cơ bỏ sót công việc từ các luồng thông báo liên tục của Trello hay Microsoft Teams, tôi đã tối ưu hóa bộ lọc cá nhân, chỉ theo dõi các thẻ việc do mình trực tiếp phụ trách và phân loại mức độ khẩn cấp bằng hệ thống nhãn màu trực quan.
                </p>
                <p className="text-justify">
                  Cuối cùng, đối với khó khăn trong việc giám sát các tác vụ có tính chất phụ thuộc lẫn nhau trên giao diện Kanban, tôi đã áp dụng giải pháp tích hợp checklist chi tiết trong từng thẻ công việc và đính kèm đường link của các tác vụ liên quan, giúp toàn đội ngũ luôn chủ động kiểm tra tiến độ của các bước tiền đề trước khi triển khai giai đoạn tiếp theo.
                </p>
              </div>
            </ScrollHighlightSection>
          </div>

          {/* Summary Rubric Supplement removed */}

          {/* Summary Rubric Checklist */}
          <div className="mt-6">
            <RubricChecklist variant="summary" />
          </div>

          {/* Action row at bottom of conclusion */}
          <div className="mt-12 bg-[#f472b6] text-white border-[2.5px] border-[#f472b6] p-8 rounded-3xl shadow-xl shadow-pink-300/20 text-center space-y-4 relative overflow-hidden">
            {/* Background absolute glowing blob */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#fce7f3]/15 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />

            <span className="text-[#fce7f3] text-xs font-black uppercase tracking-widest block font-sans">
              Nhà Quản trị Số VNU-HSB • Lộ Trình Phát Triển 2026
            </span>
            <p className="text-white/90 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-semibold">
              Trang bị tư duy công nghệ bền vững, kỹ năng cộng tác thông minh, sẵn sàng hành trang bước vào giai đoạn chuyển đổi số và quản trị số toàn diện.
            </p>
            <div className="pt-3 flex justify-center gap-4 flex-wrap sm:flex-nowrap relative z-10">
              <a
                href="#du-an"
                className="bg-white text-[#f472b6] text-xs font-black px-6 py-3 rounded-none uppercase tracking-widest transition-all shadow-md hover:-translate-x-[2px] hover:-translate-y-[2px] border-[2.5px] border-white active:scale-95 font-sans"
                style={{boxShadow: '3px 3px 0px rgba(191,219,254,0.6)'}}
              >
                Khám phá 6 Bài học số
              </a>
              <a
                href="#gioi-thieu"
                className="text-white hover:text-[#fce7f3] text-xs font-black py-3 px-6 rounded-none transition-all border-[2.5px] border-white/60 uppercase tracking-widest font-sans"
              >
                Quay lại đầu trang
              </a>
            </div>
          </div>
        </section>

        {/* 7. Academic Footer */}
        <footer className="bg-[#f472b6] border-t-[2.5px] border-[#db2777] py-12 px-6 text-center text-white/80 relative z-10">
          <div className="max-w-5xl mx-auto space-y-4">
            <p className="text-sm font-black uppercase tracking-widest text-white font-sans">
              Tô Bảo Nhi • Nhà Quản trị Số Tương Lai
            </p>
            <p className="text-xs text-[#fce7f3] font-semibold max-w-xl mx-auto font-sans">
              Sinh viên lớp VNU1001-E252036 • Trường Quản trị và Kinh doanh, Đại học Quốc gia Hà Nội
            </p>
            <p className="text-xs text-white/60 max-w-2xl mx-auto font-medium">
              VNU Gmail: <a href="https://mail.google.com/mail/?view=cm&fs=1&to=25080147@vnu.edu.vn" target="_blank" rel="noopener noreferrer" className="text-[#fce7f3] font-bold hover:underline">25080147@vnu.edu.vn</a> &nbsp;|&nbsp; Địa chỉ học tập: VNU-HSB, Xuân Thủy, Cầu Giấy, Hà Nội
            </p>
            <div className="pt-6 text-[10px] text-white/40 border-t border-white/10 max-w-xs mx-auto font-bold font-sans">
              © 2026 Tô Bảo Nhi. Deep Blue Portfolio Edition.
            </div>
          </div>
        </footer>

        {/* 8. Quick Nav FAB */}
        <button
          type="button"
          onClick={() => setQuickNavOpen(true)}
          className="quick-nav-fab no-print fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#f472b6] text-white text-xs font-black uppercase tracking-wide shadow-lg shadow-pink-400/40 border-[2.5px] border-[#db2777] hover:scale-105 hover:-translate-x-[2px] hover:-translate-y-[2px] active:scale-95 transition-all cursor-pointer"
          aria-label="Mở điều hướng nhanh"
          style={{boxShadow: '4px 4px 0px #db2777'}}
        >
          <ListTree className="w-4 h-4" />
          <span className="hidden sm:inline">Điều hướng</span>
        </button>

        {linkCopied && (
          <div
            className="no-print fixed bottom-24 right-6 z-50 bg-[#f472b6] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg border-[2.5px] border-[#db2777]"
            role="status"
          >
            Đã sao chép link bài tập
          </div>
        )}

        <QuickNavDrawer
          open={quickNavOpen}
          onClose={() => setQuickNavOpen(false)}
          navLinks={navLinks}
          currentSection={currentSection}
          portfolioProjects={portfolioProjects}
          activeTab={activeTab}
          viewMode={viewMode}
          stepTexts={(LESSON_STEPS[activeTab] ?? []).map((s) => s.text)}
          onSelectSection={(href) => {
            setMenuOpen(false);
            setQuickNavOpen(false);
            const sectionId = href.replace('#', '');
            handleMainNavClick(sectionId);
            window.location.hash = '';
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectLesson={(idx) => navigateToLesson(idx)}
          onSelectView={(view) => {
            setViewMode(view);
            setDeepLinkStep(null);
            if (view === 'dashboard') setTimeout(() => scrollToDashboardSection(), 80);
          }}
          onJumpToStep={jumpToStep}
          onCopyLessonLink={copyLessonLink}
        />

        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 bg-[#f472b6]/95 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300"
            onClick={() => setSelectedImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh minh chứng phóng to"
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/15 hover:bg-white/25 text-white rounded-xl p-2.5 transition-colors focus:outline-none z-55 cursor-pointer border-2 border-white/20"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div 
              className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Evidence Fullscreen View" 
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border-[2.5px] border-white/20"
              />
              {(() => {
                const currentProj = portfolioProjects[activeTab];
                const imgIndex = currentProj.images ? currentProj.images.indexOf(selectedImage) : -1;
                const desc = (imgIndex !== -1 && currentProj.imageDescriptions) ? currentProj.imageDescriptions[imgIndex] : '';
                return desc ? (
                  <div className="bg-white/15 text-white text-xs sm:text-sm py-2.5 px-5 rounded-xl max-w-2xl text-center backdrop-blur-md shadow-md border border-white/20 font-semibold leading-relaxed">
                    {desc}
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
