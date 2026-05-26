import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Calendar as CalendarIcon, Settings, Plus, Check, ChevronLeft, ChevronRight, 
  Circle, X, BookOpen, Briefcase, Heart, Droplets, ListTodo, Trash2, Library, 
  Sparkles, Camera, Image as ImageIcon, Bold, Italic, Highlighter, 
  Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List as ListIcon, 
  ListOrdered, Baseline, Palette, Grid, Rows, GripHorizontal, Type, Heading1, Heading2, Undo, Redo, Maximize
} from 'lucide-react';

const loadSavedData = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
  return defaultValue;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(() => loadSavedData('planner_darkmode', false));
  const [viewingImage, setViewingImage] = useState(null);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const getLocalString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const todayStr = getLocalString(today);

  const [tasks, setTasks] = useState(() => loadSavedData('planner_tasks', [
    { id: 1, text: 'Beber água e alongar', category: 'saude', completed: false, date: todayStr }
  ]));
  const [notes, setNotes] = useState(() => loadSavedData('planner_notes', []));
  const [moments, setMoments] = useState(() => loadSavedData('planner_moments', []));
  const [books, setBooks] = useState(() => loadSavedData('planner_books', []));

  useEffect(() => { localStorage.setItem('planner_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('planner_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { 
    try { localStorage.setItem('planner_moments', JSON.stringify(moments)); } 
    catch (e) { console.warn("Memória cheia ao salvar fotos."); }
  }, [moments]);
  useEffect(() => { localStorage.setItem('planner_books', JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem('planner_darkmode', JSON.stringify(darkMode)); }, [darkMode]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('pessoal');

  const [activeNote, setActiveNote] = useState(null);
  const [showPageStyles, setShowPageStyles] = useState(false);
  const editorRef = useRef(null);
  const savedSelection = useRef(null);
  
  const [activeTool, setActiveTool] = useState(null);
  const [toolColors, setToolColors] = useState({ highlight: '#fef08a', text: '#8DA396' });

  const updateSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0);
    }
  };

  const [showBookModal, setShowBookModal] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookStatus, setNewBookStatus] = useState('quero ler');

  const [showMomentModal, setShowMomentModal] = useState(false);
  const [newMomentText, setNewMomentText] = useState('');
  const [newMomentMood, setNewMomentMood] = useState('🌿');
  const [newMomentImage, setNewMomentImage] = useState(null);
  const [newMomentFilter, setNewMomentFilter] = useState('none');

  const imageFilters = [
    { name: 'Normal', value: 'none' },
    { name: 'Clarendon', value: 'contrast(1.2) saturate(1.35) sepia(0.1) hue-rotate(-15deg)' },
    { name: 'Gingham', value: 'brightness(1.05) hue-rotate(-10deg) contrast(1.1) saturate(0.9)' },
    { name: 'P&B', value: 'grayscale(100%) contrast(1.2)' }
  ];

  const pagePatterns = [
    { id: 'blank', name: 'Liso', css: '' },
    { id: 'lined', name: 'Linhas', css: 'pattern-lined' },
    { id: 'grid', name: 'Grade', css: 'pattern-grid' },
    { id: 'dotted', name: 'Pontos', css: 'pattern-dotted' }
  ];

  const pageColors = [
    { id: 'default', name: 'Padrão', cssLight: 'bg-white', cssDark: 'bg-[#1C211F]' },
    { id: 'yellow', name: 'Amarelo', cssLight: 'bg-[#FFF9C4]', cssDark: 'bg-[#4A4737]' },
    { id: 'pink', name: 'Rosa', cssLight: 'bg-[#FCE4EC]', cssDark: 'bg-[#4A3B40]' },
    { id: 'blue', name: 'Azul', cssLight: 'bg-[#E3F2FD]', cssDark: 'bg-[#34424A]' },
    { id: 'green', name: 'Verde', cssLight: 'bg-[#E8F5E9]', cssDark: 'bg-[#3A4A3F]' },
    { id: 'purple', name: 'Lilás', cssLight: 'bg-[#F3E5F5]', cssDark: 'bg-[#42394A]' }
  ];

  const getNotePattern = (note) => note?.pagePattern || (['lined', 'grid', 'dotted'].includes(note?.pageStyle) ? note.pageStyle : 'blank');
  const getNoteColorId = (note) => note?.pageColor || (['yellow', 'pink', 'blue'].includes(note?.pageStyle) ? note.pageStyle : 'default');
  const getNoteColorCss = (note, isDark) => {
    const colorId = getNoteColorId(note);
    const color = pageColors.find(c => c.id === colorId) || pageColors[0];
    return isDark ? color.cssDark : color.cssLight;
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const weekDays = [];
  for(let i = -3; i <= 3; i++) {
    const d = new Date(selectedDate);
    d.setDate(selectedDate.getDate() + i);
    weekDays.push(d);
  }

  const selectDay = (date) => { setSelectedDate(date); if(activeTab === 'calendar') setActiveTab('home'); };

  const toggleTask = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText, category: newTaskCategory, completed: false, date: getLocalString(selectedDate) }]);
    setNewTaskText(''); setShowTaskModal(false);
  };
  const dayTasks = tasks.filter(t => t.date === getLocalString(selectedDate));
  const dayMoments = moments.filter(m => m.date === getLocalString(selectedDate));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setNewMomentImage(reader.result); setNewMomentFilter('none'); };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMoment = (e) => {
    e.preventDefault();
    if (!newMomentText.trim() && !newMomentImage) return;
    setMoments([{ id: Date.now(), text: newMomentText, mood: newMomentMood, image: newMomentImage, filter: newMomentFilter, date: getLocalString(selectedDate) }, ...moments]);
    setNewMomentText(''); setNewMomentImage(null); setNewMomentFilter('none'); setShowMomentModal(false);
  };
  const deleteMoment = (id) => setMoments(moments.filter(m => m.id !== id));

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;
    setBooks([...books, { id: Date.now(), title: newBookTitle, author: newBookAuthor, status: newBookStatus }]);
    setNewBookTitle(''); setNewBookAuthor(''); setNewBookStatus('quero ler'); setShowBookModal(false);
  };
  const deleteBook = (id) => setBooks(books.filter(b => b.id !== id));
  const updateBookStatus = (id, newStatus) => setBooks(books.map(b => b.id === id ? { ...b, status: newStatus } : b));

  // --- LÓGICA CIRÚRGICA DE CORES E FONTES DO EDITOR ---

  const handleCommand = (e, command, value = null) => {
    // Não usar preventDefault se for mudança de Select (que causaria bloqueio do menu)
    if (e && e.type !== 'change') e.preventDefault();
    
    editorRef.current?.focus();

    // Se o evento foi um 'change' (dropdown da fonte), restauramos a seleção que foi perdida
    if (e && e.type === 'change' && savedSelection.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
    }

    // Correção para a PRIMEIRA palavra da página (quando o editor está vazio)
    if (command === 'fontName' && editorRef.current) {
      if (editorRef.current.textContent.trim() === '') {
        editorRef.current.innerHTML = `<font face="${value}">&#8203;</font>`;
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current.firstChild);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        savedSelection.current = range;
        return;
      }
    }

    document.execCommand(command, false, value);
    updateSelection();
  };

  // Função focada APENAS em quebrar a cor, preservando religiosamente a fonte e estilos
  const breakColorBleed = (insertSpace = false) => {
    let currentFont = document.queryCommandValue('fontName') || 'Nunito';
    currentFont = currentFont.replace(/['"]/g, ''); 
    
    let isBold = document.queryCommandState('bold');
    let isItalic = document.queryCommandState('italic');
    let isUnderline = document.queryCommandState('underline');

    const char = insertSpace ? ' &#8203;' : '&#8203;';
    
    let content = `<font face="${currentFont}">${char}</font>`;
    if (isBold) content = `<b>${content}</b>`;
    if (isItalic) content = `<i>${content}</i>`;
    if (isUnderline) content = `<u>${content}</u>`;

    // Cria uma "zona limpa" com ID para podermos focar nela após injetar
    const id = `clean-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const html = `<span id="${id}" style="background-color: transparent !important; color: inherit;">${content}</span>`;

    document.execCommand('insertHTML', false, html);

    // MÁGICA: Força o cursor a entrar DIRETAMENTE na zona limpa recém-criada
    const span = document.getElementById(id);
    if (span) {
      span.removeAttribute('id');
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(span);
      range.collapse(false); // Move para o final do conteúdo (após o zero-width space)
      sel.removeAllRanges();
      sel.addRange(range);
      savedSelection.current = range;
    }
  };

  // Função vital para Mobile: Aplica a ferramenta a um texto que JÁ está selecionado
  const applyToolToSelection = (tool, color) => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      document.execCommand('styleWithCSS', false, true);
      if (tool === 'highlight') {
        document.execCommand('backColor', false, color);
        document.execCommand('hiliteColor', false, color);
      } else if (tool === 'color') {
        document.execCommand('foreColor', false, color);
      }
      sel.collapseToEnd();
      breakColorBleed(false);
    }
  };

  const toggleTool = (e, tool) => {
    e.preventDefault();
    if (activeTool === tool) {
      setActiveTool(null);
      editorRef.current?.focus();
      breakColorBleed(false); // Limpa as cores ao desligar o botão
    } else {
      setActiveTool(tool);
      editorRef.current?.focus();
      
      // MÁGICA MOBILE: Quando clica na ferramenta, pinta imediatamente se houver texto selecionado!
      setTimeout(() => {
        applyToolToSelection(tool, tool === 'highlight' ? toolColors.highlight : toolColors.text);
      }, 10);
    }
  };

  const handleAutoPaint = () => {
    if (!activeTool) return;
    setTimeout(() => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) {
        document.execCommand('styleWithCSS', false, true);
        if (activeTool === 'highlight') {
          document.execCommand('backColor', false, toolColors.highlight);
          document.execCommand('hiliteColor', false, toolColors.highlight);
        } else if (activeTool === 'color') {
          document.execCommand('foreColor', false, toolColors.text);
        }
        sel.collapseToEnd();
        breakColorBleed(false); // Quebra a formatação assim que termina de pintar
      }
    }, 50);
  };

  // O espaço só é interceptado se houver cor a vazar!
  const handleKeyDown = (e) => {
    if (e.key === ' ') {
      const bgColor = document.queryCommandValue('backColor');
      const isHighlighted = bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'rgb(0, 0, 0)';
      
      // Só intervimos no espaço se NÃO houver ferramenta ativa E o cursor estiver preso num marcador
      if (isHighlighted && !activeTool) {
        e.preventDefault(); 
        breakColorBleed(true); // Insere o espaço limpo preservando a fonte
      }
    }
  };

  // --------------------------------------------------------

  const handleSaveNote = () => {
    const title = document.getElementById('note-title').value;
    let content = activeNote.type === 'list' ? activeNote.content : editorRef.current.innerHTML;
    const pattern = getNotePattern(activeNote);
    const color = getNoteColorId(activeNote);

    if (activeNote.id === 'new') {
      setNotes([{ id: Date.now(), title, content, type: activeNote.type, pagePattern: pattern, pageColor: color }, ...notes]);
    } else {
      setNotes(notes.map(n => n.id === activeNote.id ? { ...n, title, content, pagePattern: pattern, pageColor: color } : n));
    }
    setActiveNote(null);
    setActiveTool(null);
  };

  const deleteNote = (id) => { setNotes(notes.filter(n => n.id !== id)); setActiveNote(null); setActiveTool(null); };
  const createNewNote = (type = 'text') => setActiveNote({ id: 'new', title: '', content: type === 'list' ? '[] ' : '', type, pagePattern: 'blank', pageColor: 'default' });

  useEffect(() => {
    if (activeNote && activeNote.type === 'text' && editorRef.current) {
      if (editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content;
      }
    }
  }, [activeNote]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const categoryColors = { pessoal: 'text-[#8DA396] bg-[#F0F5F2]', trabalho: 'text-[#D4A373] bg-[#FAEDDF]', saude: 'text-[#9A8C98] bg-[#F4F0F4]', estudo: 'text-[#A9927D] bg-[#F4EFEB]' };
  const categoryIcons = { pessoal: <Heart size={14} />, trabalho: <Briefcase size={14} />, saude: <Droplets size={14} />, estudo: <BookOpen size={14} /> };
  const themeColors = darkMode ? 'bg-[#1C211F] text-[#E3EAE4]' : 'bg-[#F9FAF8] text-[#3A453D]';

  return (
    <div className={`theme-wrapper min-h-[100dvh] w-full flex justify-center font-sans ${darkMode ? 'dark-mode bg-black' : 'bg-[#EAECE9]'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Amatic+SC:wght@400;700&family=Anton&family=Bebas+Neue&family=Caveat:wght@400..700&family=Cinzel:wght@400..900&family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Dancing+Script:wght@400..700&family=Fira+Code:wght@300..700&family=Inconsolata:wght@200..900&family=Indie+Flower&family=Lobster&family=Lora:ital,wght@0,400..700;1,400..700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Oswald:wght@200..700&family=Pacifico&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Quicksand:wght@300..700&family=Righteous&family=Roboto:ital,wght@0,100..900;1,100..900&family=Shadows+Into+Light&display=swap');
        
        [contenteditable]:empty:before { content: attr(data-placeholder); color: ${darkMode ? '#6A7F72' : '#A3B8AB'}; font-style: italic; pointer-events: none; display: block; }
        
        .rich-text-content { font-family: 'Nunito', sans-serif; min-height: 50vh; outline: none; white-space: pre-wrap; word-wrap: break-word; }
        .rich-text-content * { margin-bottom: 0.3em; }
        .rich-text-content h1 { font-size: 1.8em; font-weight: bold; margin-top: 0.5em; }
        .rich-text-content h2 { font-size: 1.4em; font-weight: bold; margin-top: 0.5em; }
        .rich-text-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
        .rich-text-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.5em; }
        
        font[face="Nunito"] { font-family: 'Nunito', sans-serif !important; }
        font[face="Poppins"] { font-family: 'Poppins', sans-serif !important; }
        font[face="Quicksand"] { font-family: 'Quicksand', sans-serif !important; }
        font[face="Montserrat"] { font-family: 'Montserrat', sans-serif !important; }
        font[face="Roboto"] { font-family: 'Roboto', sans-serif !important; }
        font[face="Lora"] { font-family: 'Lora', serif !important; }
        font[face="Merriweather"] { font-family: 'Merriweather', serif !important; }
        font[face="Playfair Display"] { font-family: 'Playfair Display', serif !important; }
        font[face="Abril Fatface"] { font-family: 'Abril Fatface', serif !important; font-size: 1.1em; }
        font[face="Cinzel"] { font-family: 'Cinzel', serif !important; }
        font[face="Oswald"] { font-family: 'Oswald', sans-serif !important; }
        font[face="Righteous"] { font-family: 'Righteous', cursive !important; }
        font[face="Anton"] { font-family: 'Anton', sans-serif !important; font-size: 1.1em; }
        font[face="Bebas Neue"] { font-family: 'Bebas Neue', sans-serif !important; font-size: 1.2em; }
        font[face="Caveat"] { font-family: 'Caveat', cursive !important; font-size: 1.3em; }
        font[face="Shadows Into Light"] { font-family: 'Shadows Into Light', cursive !important; font-size: 1.2em; }
        font[face="Dancing Script"] { font-family: 'Dancing Script', cursive !important; font-size: 1.3em; }
        font[face="Pacifico"] { font-family: 'Pacifico', cursive !important; font-size: 1.2em; }
        font[face="Amatic SC"] { font-family: 'Amatic SC', cursive !important; font-size: 1.4em; font-weight: bold; }
        font[face="Indie Flower"] { font-family: 'Indie Flower', cursive !important; font-size: 1.2em; }
        font[face="Comic Neue"] { font-family: 'Comic Neue', cursive !important; }
        font[face="Lobster"] { font-family: 'Lobster', cursive !important; font-size: 1.1em; }
        font[face="Fira Code"] { font-family: 'Fira Code', monospace !important; }
        font[face="Inconsolata"] { font-family: 'Inconsolata', monospace !important; }
        font[face="Courier Prime"] { font-family: 'Courier Prime', monospace !important; }
        
        .theme-wrapper { --pattern-color: rgba(0,0,0,0.08); }
        .theme-wrapper.dark-mode { --pattern-color: rgba(255,255,255,0.08); }
        .pattern-lined { background-image: repeating-linear-gradient(transparent, transparent 31px, var(--pattern-color) 31px, var(--pattern-color) 32px); background-attachment: local; line-height: 32px; }
        .pattern-grid { background-image: linear-gradient(var(--pattern-color) 1px, transparent 1px), linear-gradient(90deg, var(--pattern-color) 1px, transparent 1px); background-size: 20px 20px; }
        .pattern-dotted { background-image: radial-gradient(var(--pattern-color) 1.5px, transparent 1.5px); background-size: 20px 20px; }
      `}</style>
      
      <div className={`w-full max-w-md ${themeColors} relative overflow-hidden flex flex-col shadow-2xl md:rounded-[3rem] md:my-4 md:border-8 md:border-[#111]`}>
        
        <div className="px-6 pt-12 pb-4 flex justify-between items-center z-10">
          <div>
            <h1 className="font-serif text-2xl tracking-wide">
              {todayStr === getLocalString(selectedDate) ? 'Hoje' : selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.','')}
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-[#8DA396]' : 'text-[#849C8A]'}`}>
              {todayStr === getLocalString(selectedDate) ? 'Tenha um dia tranquilo 🌿' : 'Planejando sementes'}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleFullscreen} className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-[#2A312D] text-[#DDE5E1]' : 'bg-white shadow-sm text-[#4A5750] hover:bg-[#F0F5F2]'}`}>
              <Maximize size={20} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-full transition-colors ${darkMode ? 'bg-[#2A312D] text-[#DDE5E1]' : 'bg-white shadow-sm text-[#4A5750] hover:bg-[#F0F5F2]'}`}>
              {darkMode ? <Circle size={20} className="fill-[#DDE5E1]" /> : <Circle size={20} />}
            </button>
          </div>
        </div>

        {(activeTab === 'home' || activeTab === 'moments') && (
          <div className="px-4 pb-6 flex justify-between shrink-0">
            {weekDays.map((date, i) => {
              const isSelected = getLocalString(date) === getLocalString(selectedDate);
              const isToday = getLocalString(date) === todayStr;
              return (
                <button 
                  key={i} onClick={() => selectDay(date)}
                  className={`flex flex-col items-center p-3 rounded-full min-w-[3rem] transition-all
                    ${isSelected ? (darkMode ? 'bg-[#4A5750] text-white' : 'bg-[#4A5750] text-white shadow-md') : (darkMode ? 'hover:bg-[#2A312D] text-[#8DA396]' : 'hover:bg-[#F0F5F2] text-[#849C8A]')}`}
                >
                  <span className="text-[10px] uppercase font-medium mb-2 opacity-80">{date.toLocaleDateString('pt-BR', { weekday: 'short' })[0]}</span>
                  <span className={`text-sm font-semibold ${isToday && !isSelected ? (darkMode ? 'text-[#DDE5E1]' : 'text-[#3A453D]') : ''}`}>{date.getDate()}</span>
                  {isToday && <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : (darkMode ? 'bg-[#8DA396]' : 'bg-[#4A5750]')}`} />}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 pb-32 scrollbar-hide">
          
          {activeTab === 'home' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="font-serif text-xl mb-4">Meu Dia</h2>
              {dayTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="opacity-50">Nenhuma semente plantada.</p>
                  <button onClick={() => setShowTaskModal(true)} className={`mt-4 px-6 py-2 rounded-full font-medium ${darkMode ? 'bg-[#4A5750] text-white' : 'bg-[#8DA396] text-white'}`}>Adicionar Tarefa</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayTasks.map(task => (
                    <div key={task.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${darkMode ? 'bg-[#242B27] border-[#2E3732]' : 'bg-white border-[#E6EDE8]'} ${task.completed ? 'opacity-50' : ''}`}>
                      <button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${task.completed ? 'bg-[#8DA396] text-white border-[#8DA396]' : (darkMode ? 'border-[#4A5750]' : 'border-[#A3B8AB] hover:bg-gray-50')}`}>
                        {task.completed && <Check size={12} />}
                      </button>
                      <span className={`flex-1 text-[15px] ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
                      <button onClick={() => deleteTask(task.id)} className={`opacity-50 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 ${darkMode ? 'text-[#8DA396] hover:text-red-400' : 'text-[#A3B8AB] hover:text-red-500'}`}><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <button onClick={() => setShowTaskModal(true)} className={`w-full py-4 border-2 border-dashed rounded-2xl opacity-60 flex items-center justify-center gap-2 hover:opacity-100 transition-opacity ${darkMode ? 'border-[#4A5750]' : 'border-[#8DA396]'}`}>
                    <Plus size={18} /> Nova Tarefa
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-serif text-2xl capitalize">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                <div className="flex gap-2">
                  <button onClick={handlePrevMonth} className={`p-2 rounded-full border ${darkMode ? 'border-[#2E3732] hover:bg-[#2A312D]' : 'border-[#E6EDE8] hover:bg-[#F0F5F2]'}`}><ChevronLeft size={20} /></button>
                  <button onClick={handleNextMonth} className={`p-2 rounded-full border ${darkMode ? 'border-[#2E3732] hover:bg-[#2A312D]' : 'border-[#E6EDE8] hover:bg-[#F0F5F2]'}`}><ChevronRight size={20} /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium mb-4 opacity-50 uppercase">
                {['D','S','T','Q','Q','S','S'].map((d, i) => <div key={i}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const dateString = getLocalString(dateObj);
                  const isSelected = getLocalString(selectedDate) === dateString;
                  const isToday = todayStr === dateString;
                  const hasTasks = tasks.some(t => t.date === dateString);
                  
                  return (
                    <button 
                      key={day} onClick={() => selectDay(dateObj)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-2xl relative transition-all
                        ${isSelected ? (darkMode ? 'bg-[#4A5750] text-white' : 'bg-[#8DA396] text-white shadow-md') : (darkMode ? 'bg-[#242B27] hover:bg-[#2A312D]' : 'bg-white hover:bg-gray-50 border border-[#E6EDE8]')}
                        ${isToday && !isSelected ? (darkMode ? 'border-2 border-[#8DA396]' : 'border-2 border-[#8DA396]') : ''}`}
                    >
                      <span className="text-sm">{day}</span>
                      {hasTasks && <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#8DA396]'}`} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'moments' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl">Memórias</h2>
                <button onClick={() => setShowMomentModal(true)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'bg-[#2A312D] text-[#8DA396]' : 'bg-[#F0F5F2] text-[#849C8A]'}`}>
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-4">
                {dayMoments.length === 0 ? (
                  <div className="text-center py-12 opacity-50">Nenhum registro hoje.</div>
                ) : (
                  dayMoments.map(m => (
                    <div key={m.id} className={`p-5 rounded-3xl border relative group ${darkMode ? 'bg-[#242B27] border-[#2E3732]' : 'bg-white border-[#E6EDE8] shadow-sm'}`}>
                      <div className="text-3xl mb-3">{m.mood}</div>
                      <p className="mb-3 leading-relaxed text-[15px] whitespace-pre-wrap">{m.text}</p>
                      {m.image && (
                        <img 
                          src={m.image} 
                          alt="Momento" 
                          onClick={() => setViewingImage({ src: m.image, filter: m.filter })}
                          style={{ filter: m.filter }}
                          className="rounded-2xl w-full object-cover max-h-64 mt-2 border border-black/5 cursor-pointer hover:opacity-90 transition-opacity" 
                        />
                      )}
                      <button onClick={() => deleteMoment(m.id)} className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"><Trash2 size={16} /></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'journal' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl">Caderno</h2>
                <div className="flex gap-2">
                  <button onClick={() => createNewNote('text')} className={`p-2.5 rounded-full transition-colors ${darkMode ? 'bg-[#4A5750] text-[#E3EAE4]' : 'bg-[#8DA396] text-white shadow-sm'}`}><Plus size={18} /></button>
                  <button onClick={() => createNewNote('list')} className={`p-2.5 rounded-full border transition-colors ${darkMode ? 'border-[#4A5750] text-[#8DA396]' : 'border-[#E6EDE8] text-[#8DA396] bg-white'}`}><ListTodo size={18} /></button>
                </div>
              </div>
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <div className="text-center py-12 opacity-50">Seu caderno está vazio.</div>
                ) : (
                  notes.map(note => {
                    const patternCss = pagePatterns.find(p => p.id === getNotePattern(note))?.css || '';
                    const colorCss = getNoteColorCss(note, darkMode);
                    const isDefaultColor = getNoteColorId(note) === 'default';

                    return (
                      <div key={note.id} onClick={() => setActiveNote(note)} className={`p-5 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] ${patternCss} ${colorCss} ${darkMode && isDefaultColor ? 'border-[#2E3732]' : (isDefaultColor ? 'border-[#E6EDE8] shadow-sm' : 'border-transparent shadow-sm')}`}>
                        <div className="flex justify-between mb-2 items-start">
                          <h3 className="font-medium text-lg bg-white/40 dark:bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">{note.title || 'Sem título'}</h3>
                          {note.type === 'list' && <ListTodo size={16} className="opacity-40" />}
                        </div>
                        <p className="text-sm opacity-60 line-clamp-2 leading-relaxed bg-white/40 dark:bg-black/20 px-2 py-1 rounded backdrop-blur-sm">
                          {note.type === 'list' ? note.content.replace(/\[[xX ]?\]\s*/g, '• ') : note.content.replace(/<[^>]+>/g, ' ')}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl">Biblioteca</h2>
                <button onClick={() => setShowBookModal(true)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'bg-[#2A312D] text-[#8DA396]' : 'bg-[#F0F5F2] text-[#849C8A]'}`}><Plus size={20} /></button>
              </div>
              <div className="space-y-4">
                {books.length === 0 ? (
                  <div className="text-center py-12 opacity-50">Sua estante está vazia.</div>
                ) : (
                  ['lendo', 'quero ler', 'lido'].map(statusG => {
                    const groupBooks = books.filter(b => b.status === statusG);
                    if (groupBooks.length === 0) return null;
                    return (
                      <div key={statusG} className="mb-6">
                        <h3 className={`text-xs font-medium uppercase tracking-wider mb-3 ${darkMode ? 'text-[#8DA396]' : 'text-[#849C8A]'}`}>{statusG}</h3>
                        <div className="space-y-3">
                          {groupBooks.map(book => (
                            <div key={book.id} className={`p-4 rounded-[1.5rem] flex items-center justify-between border ${darkMode ? 'bg-[#242B27] border-[#2E3732]' : 'bg-white border-[#E6EDE8] shadow-sm'}`}>
                              <div className="flex-1 pr-4">
                                <h4 className="font-medium text-[15px] truncate">{book.title}</h4>
                                <p className="text-xs mt-1 opacity-60 truncate">{book.author || 'Autor desconhecido'}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <select 
                                  value={book.status} onChange={(e) => updateBookStatus(book.id, e.target.value)}
                                  className={`text-[10px] uppercase tracking-wider px-2 py-1.5 rounded-lg outline-none cursor-pointer border-none ${darkMode ? 'bg-[#1C211F] text-[#8DA396]' : 'bg-[#F0F5F2] text-[#849C8A]'}`}
                                >
                                  <option value="quero ler">Quero Ler</option><option value="lendo">Lendo</option><option value="lido">Lido</option>
                                </select>
                                <button onClick={() => deleteBook(book.id)} className="p-1.5 rounded-md opacity-40 hover:opacity-100 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {viewingImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setViewingImage(null)}>
            <button onClick={() => setViewingImage(null)} className="absolute top-6 right-6 p-3 text-white/80 hover:text-white bg-black/50 rounded-full z-[101]"><X size={28} /></button>
            <img src={viewingImage.src} style={{ filter: viewingImage.filter }} className="max-w-full max-h-full object-contain select-none shadow-2xl" alt="Ampliada" />
          </div>
        )}

        {showTaskModal && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowTaskModal(false)} />
            <div className={`relative w-full rounded-t-[2.5rem] p-6 animate-in slide-in-from-bottom-full duration-300 ${darkMode ? 'bg-[#1C211F]' : 'bg-[#F9FAF8]'}`}>
              <div className="w-12 h-1.5 rounded-full mx-auto mb-6 bg-black/10 dark:bg-white/10" />
              <form onSubmit={handleAddTask}>
                <input autoFocus type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="O que vamos plantar hoje?" className="w-full text-lg bg-transparent outline-none mb-6 font-medium placeholder:opacity-40" />
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                  {Object.keys(categoryColors).map(cat => (
                    <button key={cat} type="button" onClick={() => setNewTaskCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-medium capitalize flex items-center gap-2 transition-all whitespace-nowrap border ${newTaskCategory === cat ? categoryColors[cat] : (darkMode ? 'bg-transparent border-[#2E3732] text-[#8DA396]' : 'bg-transparent border-[#E6EDE8] text-[#849C8A]')}`}>{categoryIcons[cat]} {cat}</button>
                  ))}
                </div>
                <button type="submit" disabled={!newTaskText.trim()} className={`w-full py-4 rounded-[1.5rem] font-medium transition-colors disabled:opacity-50 ${darkMode ? 'bg-[#DDE5E1] text-[#1C211F]' : 'bg-[#4A5750] text-white'}`}>Plantar</button>
              </form>
            </div>
          </div>
        )}

        {showMomentModal && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowMomentModal(false)} />
            <div className={`relative w-full h-[85%] rounded-t-[2.5rem] p-6 flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${darkMode ? 'bg-[#1C211F]' : 'bg-[#F9FAF8]'}`}>
              <div className="w-12 h-1.5 rounded-full mx-auto mb-6 bg-black/10 dark:bg-white/10 shrink-0" />
              <h3 className="font-serif text-lg mb-4 text-center">Registrar Momento</h3>
              <div className="flex-1 overflow-y-auto pb-4 scrollbar-hide">
                <form id="moment-form" onSubmit={handleAddMoment}>
                  <div className="mb-4">
                    <textarea autoFocus value={newMomentText} onChange={(e) => setNewMomentText(e.target.value)} placeholder="O que aconteceu hoje?" rows="3" className={`w-full p-4 rounded-[1.5rem] outline-none text-base border transition-colors resize-none ${darkMode ? 'bg-[#242B27] border-[#2E3732] focus:border-[#849C8A]' : 'bg-white border-[#E6EDE8] focus:border-[#849C8A]'}`} />
                  </div>
                  <div className="mb-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium flex items-center gap-2 ${darkMode ? 'text-[#8DA396]' : 'text-[#849C8A]'}`}><ImageIcon size={16} /> Adicionar foto</span>
                      <label className={`p-2 rounded-full cursor-pointer transition-colors ${darkMode ? 'bg-[#2A312D] text-[#8DA396]' : 'bg-[#F0F5F2] text-[#849C8A]'}`}>
                        <Camera size={20} /><input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                    {newMomentImage && (
                      <div className="space-y-3">
                        <div className="relative w-full h-48 rounded-[1.5rem] overflow-hidden group shadow-sm border border-[#E6EDE8] dark:border-[#2E3732]">
                          <img src={newMomentImage} alt="Preview" style={{ filter: newMomentFilter }} className="w-full h-full object-cover transition-all" />
                          <button type="button" onClick={() => setNewMomentImage(null)} className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"><Trash2 size={16} /></button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {imageFilters.map(filter => (
                            <button
                              key={filter.name} type="button" onClick={() => setNewMomentFilter(filter.value)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${newMomentFilter === filter.value ? (darkMode ? 'bg-[#DDE5E1] text-[#1C211F]' : 'bg-[#4A5750] text-white') : (darkMode ? 'border-[#2E3732] text-[#8DA396]' : 'border-[#E6EDE8] text-[#849C8A]')}`}
                            >
                              {filter.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mb-8">
                    <div className="flex justify-between px-2 overflow-x-auto gap-4 pb-2 scrollbar-hide">
                      {['🌿', '🌸', '☀️', '☕', '🌧️', '📚', '🧘‍♀️','😍','😎','🎶','😴','😷','😻','🙁','🤣'].map(emoji => (
                        <button key={emoji} type="button" onClick={() => setNewMomentMood(emoji)} className={`text-2xl p-2 rounded-full transition-all shrink-0 ${newMomentMood === emoji ? (darkMode ? 'bg-[#4A5750]' : 'bg-[#E6EDE8] scale-110') : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100'}`}>{emoji}</button>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
              <div className="shrink-0 pt-2">
                <button form="moment-form" type="submit" disabled={!newMomentText.trim() && !newMomentImage} className={`w-full py-4 rounded-[1.5rem] font-medium transition-colors disabled:opacity-50 ${darkMode ? 'bg-[#DDE5E1] text-[#1C211F]' : 'bg-[#4A5750] text-white'}`}>Guardar Memória</button>
              </div>
            </div>
          </div>
        )}

        {showBookModal && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowBookModal(false)} />
            <div className={`relative w-full rounded-t-[2.5rem] p-6 flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${darkMode ? 'bg-[#1C211F]' : 'bg-[#F9FAF8]'}`}>
              <div className="w-12 h-1.5 rounded-full mx-auto mb-6 bg-black/10 dark:bg-white/10 shrink-0" />
              <h3 className="font-serif text-lg mb-6 text-center">Adicionar Livro</h3>
              <form onSubmit={handleAddBook}>
                <input autoFocus type="text" value={newBookTitle} onChange={(e) => setNewBookTitle(e.target.value)} placeholder="Título do livro" className={`w-full p-4 rounded-[1.5rem] outline-none text-sm border mb-3 transition-colors ${darkMode ? 'bg-[#242B27] border-[#2E3732]' : 'bg-white border-[#E6EDE8]'}`} />
                <input type="text" value={newBookAuthor} onChange={(e) => setNewBookAuthor(e.target.value)} placeholder="Autor (opcional)" className={`w-full p-4 rounded-[1.5rem] outline-none text-sm border mb-4 transition-colors ${darkMode ? 'bg-[#242B27] border-[#2E3732]' : 'bg-white border-[#E6EDE8]'}`} />
                <span className={`text-sm font-medium mb-3 block ${darkMode ? 'text-[#8DA396]' : 'text-[#849C8A]'}`}>Status</span>
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                  {['quero ler', 'lendo', 'lido'].map(status => (
                    <button key={status} type="button" onClick={() => setNewBookStatus(status)} className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-colors border ${newBookStatus === status ? (darkMode ? 'bg-[#4A5750] border-[#4A5750] text-[#E3EAE4]' : 'bg-[#4A5750] border-[#4A5750] text-white') : (darkMode ? 'bg-transparent border-[#2E3732] text-[#8DA396]' : 'bg-transparent border-[#E6EDE8] text-[#849C8A]')}`}>{status}</button>
                  ))}
                </div>
                <button type="submit" disabled={!newBookTitle.trim()} className={`w-full py-4 rounded-[1.5rem] font-medium transition-colors disabled:opacity-50 ${darkMode ? 'bg-[#DDE5E1] text-[#1C211F]' : 'bg-[#4A5750] text-white'}`}>Adicionar à Biblioteca</button>
              </form>
            </div>
          </div>
        )}

        {activeNote && (
          <div className={`absolute inset-0 z-50 flex flex-col animate-in slide-in-from-bottom duration-300 ${darkMode ? 'bg-[#1C211F]' : 'bg-[#F9FAF8]'}`}>
            <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-[#2E3732] bg-[#1C211F]' : 'border-[#E6EDE8] bg-white'} z-10`}>
              <button onClick={() => setActiveNote(null)} className="p-2"><ChevronLeft size={24} /></button>
              <div className="flex gap-2 items-center">
                <button onClick={() => setShowPageStyles(!showPageStyles)} className={`p-2 rounded-full transition-colors ${showPageStyles ? 'bg-[#4A5750] text-white' : 'text-[#8DA396] hover:bg-gray-100 dark:hover:bg-[#2A312D]'}`} title="Aparência da Página">
                  <Palette size={20} />
                </button>
                {activeNote.id !== 'new' && <button onClick={() => deleteNote(activeNote.id)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"><Trash2 size={20} /></button>}
                <button onClick={handleSaveNote} className={`ml-2 px-4 py-1.5 rounded-full text-sm font-medium ${darkMode ? 'bg-[#DDE5E1] text-[#1C211F]' : 'bg-[#4A5750] text-white'}`}>Salvar</button>
              </div>
            </div>

            {/* Sub-menu Inteligente para Padrões e Cores */}
            {showPageStyles && (
              <div className={`flex flex-col gap-4 p-4 border-b shrink-0 shadow-inner ${darkMode ? 'border-[#2E3732] bg-[#242B27]' : 'border-[#E6EDE8] bg-[#F0F5F2]'}`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${darkMode ? 'text-[#8DA396]' : 'text-[#849C8A]'}`}>1. Tipo de Página</span>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {pagePatterns.map(pattern => (
                      <button 
                        key={pattern.id} 
                        onClick={() => setActiveNote({...activeNote, pagePattern: pattern.id})}
                        className={`shrink-0 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all
                          ${getNotePattern(activeNote) === pattern.id ? (darkMode?'border-[#8DA396] text-[#E3EAE4]':'border-[#4A5750] text-[#3A453D]') : (darkMode?'border-transparent text-[#8DA396] bg-[#1C211F]':'border-transparent text-[#849C8A] bg-white')}
                        `}
                      >
                        {pattern.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${darkMode ? 'text-[#8DA396]' : 'text-[#849C8A]'}`}>2. Cor de Fundo</span>
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 px-1">
                    {pageColors.map(color => (
                      <button 
                        key={color.id} 
                        onClick={() => setActiveNote({...activeNote, pageColor: color.id})}
                        className={`shrink-0 w-10 h-10 rounded-full border-4 transition-all shadow-sm
                          ${getNoteColorId(activeNote) === color.id ? (darkMode?'border-[#8DA396] scale-110':'border-[#4A5750] scale-110') : 'border-transparent'}
                          ${darkMode ? color.cssDark : color.cssLight}
                        `}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className={`flex-1 flex flex-col overflow-y-auto transition-colors duration-300
              ${pagePatterns.find(p => p.id === getNotePattern(activeNote))?.css} 
              ${getNoteColorCss(activeNote, darkMode)}`}
            >
              <div className="px-6 pt-6">
                <input id="note-title" defaultValue={activeNote.title} placeholder="Título da Nota" className="w-full text-3xl font-serif bg-transparent outline-none mb-4 placeholder:opacity-40 font-bold" />
              </div>

              {activeNote.type === 'list' ? (
                <div className="flex-1 px-6 pb-24">
                  {activeNote.content.split('\n').map((line, index) => {
                    const isChecked = line.startsWith('[x]') || line.startsWith('[X]');
                    const text = line.replace(/^\[[xX ]?\]\s*/, '');
                    return (
                      <div key={index} className="flex items-start gap-3 mb-4 group">
                        <button onClick={() => { const lines = activeNote.content.split('\n'); lines[index] = isChecked ? `[] ${text}` : `[x] ${text}`; setActiveNote({...activeNote, content: lines.join('\n')}); }} className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors shrink-0 ${isChecked ? 'bg-[#8DA396] border-[#8DA396] text-white' : (darkMode ? 'border-[#4A5750]' : 'border-[#A3B8AB]')}`}>
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </button>
                        <textarea 
                          id={`list-input-${index}`}
                          value={text} placeholder="Novo item..."
                          rows="1"
                          onChange={(e) => { 
                            const lines = activeNote.content.split('\n');
                            lines[index] = (isChecked ? '[x] ' : '[] ') + e.target.value;
                            e.target.style.height = 'inherit';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                            setActiveNote({...activeNote, content: lines.join('\n')}); 
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const lines = activeNote.content.split('\n');
                              lines.splice(index + 1, 0, '[] ');
                              setActiveNote({...activeNote, content: lines.join('\n')});
                              setTimeout(() => document.getElementById(`list-input-${index + 1}`)?.focus(), 50);
                            } else if (e.key === 'Backspace' && text === '') {
                              e.preventDefault();
                              const lines = activeNote.content.split('\n');
                              if (lines.length > 1) {
                                lines.splice(index, 1);
                                setActiveNote({...activeNote, content: lines.join('\n')});
                                setTimeout(() => {
                                  const prev = document.getElementById(`list-input-${index - 1}`);
                                  if(prev) { prev.focus(); prev.setSelectionRange(prev.value.length, prev.value.length); }
                                }, 50);
                              }
                            }
                          }}
                          className={`flex-1 bg-transparent outline-none text-[16px] resize-none overflow-hidden ${isChecked ? 'line-through opacity-50' : ''}`}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div 
                  ref={editorRef}
                  contentEditable="true"
                  suppressContentEditableWarning={true}
                  onMouseUp={(e) => { updateSelection(); handleAutoPaint(); }}
                  onKeyUp={updateSelection}
                  onMouseLeave={updateSelection}
                  onTouchEnd={(e) => { updateSelection(); handleAutoPaint(); }}
                  onKeyDown={handleKeyDown}
                  data-placeholder="Toque aqui para começar a escrever..."
                  className="rich-text-content flex-1 bg-transparent outline-none px-6 pb-32 text-[16px]"
                />
              )}
            </div>

            {activeNote.type === 'text' && (
              <div className={`absolute bottom-0 w-full flex items-center gap-2 px-2 py-3 border-t overflow-x-auto scrollbar-hide shrink-0 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] ${darkMode ? 'border-[#2E3732] bg-[#1C211F]' : 'border-[#E6EDE8] bg-white'}`}>
                
                <button onPointerDown={(e) => handleCommand(e, 'undo')} className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${darkMode?'text-[#8DA396]':'text-[#4A5750]'}`}><Undo size={18} /></button>
                <button onPointerDown={(e) => handleCommand(e, 'redo')} className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${darkMode?'text-[#8DA396]':'text-[#4A5750]'}`}><Redo size={18} /></button>
                <div className="w-px h-6 bg-gray-300 dark:bg-[#4A5750] shrink-0 mx-1" />

                <select onChange={(e) => handleCommand(e, 'fontName', e.target.value)} className={`bg-black/5 dark:bg-white/10 outline-none text-sm p-1.5 rounded-lg cursor-pointer font-medium ${darkMode?'text-[#E3EAE4]':'text-[#3A453D]'}`}>
                  <optgroup label="Geométricas & Limpas" style={{ fontFamily: 'sans-serif' }}>
                    <option value="Nunito" style={{ fontFamily: "'Nunito', sans-serif" }}>Moderna (Nunito)</option>
                    <option value="Poppins" style={{ fontFamily: "'Poppins', sans-serif" }}>Limpa (Poppins)</option>
                    <option value="Quicksand" style={{ fontFamily: "'Quicksand', sans-serif" }}>Redonda (Quicksand)</option>
                    <option value="Montserrat" style={{ fontFamily: "'Montserrat', sans-serif" }}>Clara (Montserrat)</option>
                    <option value="Roboto" style={{ fontFamily: "'Roboto', sans-serif" }}>Padrão (Roboto)</option>
                    <option value="Anton" style={{ fontFamily: "'Anton', sans-serif" }}>Forte (Anton)</option>
                  </optgroup>
                  <optgroup label="Clássicas & Livro" style={{ fontFamily: 'serif' }}>
                    <option value="Lora" style={{ fontFamily: "'Lora', serif" }}>Livro (Lora)</option>
                    <option value="Merriweather" style={{ fontFamily: "'Merriweather', serif" }}>Serifa (Merriweather)</option>
                    <option value="Playfair Display" style={{ fontFamily: "'Playfair Display', serif" }}>Elegante (Playfair)</option>
                    <option value="Abril Fatface" style={{ fontFamily: "'Abril Fatface', serif" }}>Poster (Abril)</option>
                    <option value="Cinzel" style={{ fontFamily: "'Cinzel', serif" }}>Épica (Cinzel)</option>
                  </optgroup>
                  <optgroup label="Desenhadas & Diário" style={{ fontFamily: 'cursive' }}>
                    <option value="Caveat" style={{ fontFamily: "'Caveat', cursive", fontSize: '1.2em' }}>Manuscrita (Caveat)</option>
                    <option value="Shadows Into Light" style={{ fontFamily: "'Shadows Into Light', cursive" }}>Diário (Shadows)</option>
                    <option value="Dancing Script" style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.1em' }}>Cursiva (Dancing)</option>
                    <option value="Pacifico" style={{ fontFamily: "'Pacifico', cursive" }}>Divertida (Pacifico)</option>
                    <option value="Amatic SC" style={{ fontFamily: "'Amatic SC', cursive", fontSize: '1.2em', fontWeight: 'bold' }}>Desenhada (Amatic)</option>
                    <option value="Indie Flower" style={{ fontFamily: "'Indie Flower', cursive" }}>Alegre (Indie)</option>
                    <option value="Comic Neue" style={{ fontFamily: "'Comic Neue', cursive" }}>Casual (Comic)</option>
                    <option value="Lobster" style={{ fontFamily: "'Lobster', cursive" }}>Clássica Cursiva (Lobster)</option>
                  </optgroup>
                  <optgroup label="Títulos & Retrô" style={{ fontFamily: 'sans-serif' }}>
                    <option value="Oswald" style={{ fontFamily: "'Oswald', sans-serif" }}>Estreita (Oswald)</option>
                    <option value="Bebas Neue" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1em' }}>Impacto (Bebas)</option>
                    <option value="Righteous" style={{ fontFamily: "'Righteous', cursive" }}>Gamer (Righteous)</option>
                    <option value="Fira Code" style={{ fontFamily: "'Fira Code', monospace" }}>Código (Fira)</option>
                    <option value="Inconsolata" style={{ fontFamily: "'Inconsolata', monospace" }}>Terminal (Inconsolata)</option>
                    <option value="Courier Prime" style={{ fontFamily: "'Courier Prime', monospace" }}>Máquina (Courier)</option>
                  </optgroup>
                </select>
                <div className="w-px h-6 bg-gray-300 dark:bg-[#4A5750] shrink-0 mx-1" />

                <button onPointerDown={(e) => handleCommand(e, 'bold')} className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${darkMode?'text-[#8DA396]':'text-[#4A5750]'}`}><Bold size={18} /></button>
                <button onPointerDown={(e) => handleCommand(e, 'italic')} className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${darkMode?'text-[#8DA396]':'text-[#4A5750]'}`}><Italic size={18} /></button>
                <button onPointerDown={(e) => handleCommand(e, 'underline')} className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${darkMode?'text-[#8DA396]':'text-[#4A5750]'}`}><Underline size={18} /></button>
                <button onPointerDown={(e) => handleCommand(e, 'strikethrough')} className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${darkMode?'text-[#8DA396]':'text-[#4A5750]'}`}><Strikethrough size={18} /></button>
                <div className="w-px h-6 bg-gray-300 dark:bg-[#4A5750] shrink-0 mx-1" />

                <div className={`flex items-center rounded-lg border transition-colors ${activeTool === 'color' ? (darkMode ? 'bg-[#4A5750] border-[#8DA396]' : 'bg-[#E6EDE8] border-[#849C8A]') : 'border-transparent'}`}>
                  <button 
                    onPointerDown={(e) => toggleTool(e, 'color')}
                    className={`p-2 rounded-l-lg ${darkMode?'text-[#8DA396]':'text-[#4A5750]'}`}
                  >
                    <Baseline size={18} />
                  </button>
                  <label onPointerDown={updateSelection} className="p-2 cursor-pointer rounded-r-lg flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full shadow-inner border border-black/20" style={{ backgroundColor: toolColors.text }} />
                    <input type="color" value={toolColors.text} onChange={(e) => { 
                      const newColor = e.target.value;
                      setToolColors(prev => ({...prev, text: newColor})); 
                      setActiveTool('color'); 
                      editorRef.current?.focus();
                      if (savedSelection.current) {
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(savedSelection.current);
                      }
                      setTimeout(() => applyToolToSelection('color', newColor), 10);
                    }} className="hidden" />
                  </label>
                </div>

                <div className={`flex items-center rounded-lg border transition-colors ml-1 ${activeTool === 'highlight' ? (darkMode ? 'bg-[#4A5750] border-[#8DA396]' : 'bg-[#E6EDE8] border-[#849C8A]') : 'border-transparent'}`}>
                  <button 
                    onPointerDown={(e) => toggleTool(e, 'highlight')}
                    className={`p-2 rounded-l-lg ${darkMode?'text-[#8DA396]':'text-[#4A5750]'}`}
                  >
                    <Highlighter size={18} />
                  </button>
                  <label onPointerDown={updateSelection} className="p-2 cursor-pointer rounded-r-lg flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full shadow-inner border border-black/20" style={{ backgroundColor: toolColors.highlight }} />
                    <input type="color" value={toolColors.highlight} onChange={(e) => { 
                      const newColor = e.target.value;
                      setToolColors(prev => ({...prev, highlight: newColor})); 
                      setActiveTool('highlight'); 
                      editorRef.current?.focus();
                      if (savedSelection.current) {
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(savedSelection.current);
                      }
                      setTimeout(() => applyToolToSelection('highlight', newColor), 10);
                    }} className="hidden" />
                  </label>
                </div>
                <div className="w-px h-6 bg-gray-300 dark:bg-[#4A5750] shrink-0 mx-1" />

                <button onPointerDown={(e) => handleCommand(e, 'insertUnorderedList')} className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${darkMode?'text-[#8DA396]':'text-[#4A5750]'}`}><ListIcon size={18} /></button>
                <button onPointerDown={(e) => handleCommand(e, 'insertOrderedList')} className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${darkMode?'text-[#8DA396]':'text-[#4A5750]'}`}><ListOrdered size={18} /></button>
                <button onPointerDown={(e) => handleCommand(e, 'justifyLeft')} className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${darkMode?'text-[#8DA396]':'text-[#4A5750]'}`}><AlignLeft size={18} /></button>
                <button onPointerDown={(e) => handleCommand(e, 'justifyCenter')} className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${darkMode?'text-[#8DA396]':'text-[#4A5750]'}`}><AlignCenter size={18} /></button>
                
                <div className="pr-6 shrink-0" />
              </div>
            )}
          </div>
        )}

        <div className={`absolute bottom-0 w-full px-6 pb-6 pt-4 rounded-b-[2.5rem] bg-gradient-to-t pointer-events-none z-20 ${darkMode ? 'from-[#1C211F] via-[#1C211F] to-transparent' : 'from-[#F9FAF8] via-[#F9FAF8] to-transparent'}`}>
          <div className={`flex justify-around items-center p-2 rounded-full shadow-lg border backdrop-blur-md pointer-events-auto ${darkMode ? 'bg-[#242B27]/90 border-[#2E3732]' : 'bg-white/95 border-[#E6EDE8]'}`}>
            {[ { id: 'home', icon: Home }, { id: 'calendar', icon: CalendarIcon }, { id: 'moments', icon: Sparkles, isCenter: true }, { id: 'journal', icon: BookOpen }, { id: 'library', icon: Library } ].map(tab => (
              <button 
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative p-3 rounded-full transition-all duration-300
                  ${tab.isCenter ? `w-12 h-12 flex items-center justify-center shadow-inner ${darkMode ? 'bg-[#4A5750] text-[#E3EAE4]' : 'bg-[#E6EDE8] text-[#3A453D]'}` : ''}
                  ${activeTab === tab.id && !tab.isCenter ? (darkMode ? 'text-[#DDE5E1]' : 'text-[#4A5750]') : (darkMode ? 'text-[#6A7F72]' : 'text-[#A3B8AB]')} hover:scale-110`}
              >
                <tab.icon size={tab.isCenter ? 24 : 20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                {activeTab === tab.id && !tab.isCenter && <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${darkMode ? 'bg-[#DDE5E1]' : 'bg-[#4A5750]'}`} />}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}