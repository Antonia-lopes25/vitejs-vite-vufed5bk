import React, { useState, useEffect } from 'react';
import {
  Home,
  Calendar as CalendarIcon,
  Settings,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle2,
  MoreHorizontal,
  X,
  BookOpen,
  Coffee,
  Briefcase,
  Heart,
  Droplets,
  Wind,
  ListTodo,
  Square,
  CheckSquare,
  PlusCircle,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Trash2,
  Library,
  BookMarked,
} from 'lucide-react';

// --- FUNÇÃO PARA CARREGAR DADOS SALVOS ---
const loadSavedData = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
  return defaultValue;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(() =>
    loadSavedData('planner_darkmode', false)
  );

  // Controle do calendário e datas
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const getLocalString = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const todayStr = getLocalString(today);

  // --- ESTADOS COM SALVAMENTO AUTOMÁTICO (Local Storage) ---
  const [tasks, setTasks] = useState(() =>
    loadSavedData('planner_tasks', [
      {
        id: 1,
        text: 'Beber água e alongar',
        category: 'saude',
        completed: false,
        date: todayStr,
      },
    ])
  );

  const [notes, setNotes] = useState(() =>
    loadSavedData('planner_notes', [
      {
        id: 1,
        title: 'Ideias de Plantas',
        content: 'Suculentas para a janela da sala.',
        type: 'text',
      },
    ])
  );

  const [moments, setMoments] = useState(() =>
    loadSavedData('planner_moments', [])
  );

  const [books, setBooks] = useState(() => loadSavedData('planner_books', []));

  // --- EFEITOS PARA SALVAR QUANDO HOUVER MUDANÇAS ---
  useEffect(() => {
    localStorage.setItem('planner_tasks', JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem('planner_notes', JSON.stringify(notes));
  }, [notes]);

  // Tratamento especial para momentos (limite de tamanho por causa das fotos base64)
  useEffect(() => {
    try {
      localStorage.setItem('planner_moments', JSON.stringify(moments));
    } catch (e) {
      alert('Memória cheia! Tente apagar algumas fotos antigas.');
    }
  }, [moments]);

  useEffect(() => {
    localStorage.setItem('planner_books', JSON.stringify(books));
  }, [books]);
  useEffect(() => {
    localStorage.setItem('planner_darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  // --- CONTROLES DOS MODAIS ---
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('pessoal');

  const [activeNote, setActiveNote] = useState(null);

  const [showBookModal, setShowBookModal] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookStatus, setNewBookStatus] = useState('quero ler');

  const [showMomentModal, setShowMomentModal] = useState(false);
  const [newMomentText, setNewMomentText] = useState('');
  const [newMomentMood, setNewMomentMood] = useState('🌿');
  const [newMomentImage, setNewMomentImage] = useState(null);

  // --- FUNÇÕES DE CALENDÁRIO ---
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const handlePrevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  const handleNextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );

  const weekDays = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(selectedDate);
    d.setDate(selectedDate.getDate() + i);
    weekDays.push(d);
  }

  const selectDay = (date) => {
    setSelectedDate(date);
    if (activeTab === 'calendar') setActiveTab('home');
  };

  // --- FUNÇÕES DE TAREFAS ---
  const toggleTask = (id) =>
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: newTaskText,
        category: newTaskCategory,
        completed: false,
        date: getLocalString(selectedDate),
      },
    ]);
    setNewTaskText('');
    setShowTaskModal(false);
  };

  const dayTasks = tasks.filter((t) => t.date === getLocalString(selectedDate));

  // --- FUNÇÕES DE MOMENTOS ---
  const dayMoments = moments.filter(
    (m) => m.date === getLocalString(selectedDate)
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewMomentImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddMoment = (e) => {
    e.preventDefault();
    if (!newMomentText.trim() && !newMomentImage) return;
    setMoments([
      {
        id: Date.now(),
        text: newMomentText,
        mood: newMomentMood,
        image: newMomentImage,
        date: getLocalString(selectedDate),
      },
      ...moments,
    ]);
    setNewMomentText('');
    setNewMomentImage(null);
    setShowMomentModal(false);
  };

  const deleteMoment = (id) => setMoments(moments.filter((m) => m.id !== id));

  // --- FUNÇÕES DE LIVROS ---
  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;
    setBooks([
      ...books,
      {
        id: Date.now(),
        title: newBookTitle,
        author: newBookAuthor,
        status: newBookStatus,
      },
    ]);
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookStatus('quero ler');
    setShowBookModal(false);
  };

  const deleteBook = (id) => setBooks(books.filter((b) => b.id !== id));
  const updateBookStatus = (id, newStatus) =>
    setBooks(books.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));

  // --- FUNÇÕES DE NOTAS ---
  const handleSaveNote = (title, content, type) => {
    if (activeNote.id === 'new') {
      setNotes([{ id: Date.now(), title, content, type }, ...notes]);
    } else {
      setNotes(
        notes.map((n) =>
          n.id === activeNote.id ? { ...n, title, content, type } : n
        )
      );
    }
    setActiveNote(null);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
    setActiveNote(null);
  };
  const createNewNote = (type = 'text') =>
    setActiveNote({
      id: 'new',
      title: '',
      content: type === 'list' ? '[] ' : '',
      type,
    });

  // --- CORES & TEMAS ---
  const categoryColors = {
    pessoal: 'text-[#8DA396] bg-[#F0F5F2]',
    trabalho: 'text-[#D4A373] bg-[#FAEDDF]',
    saude: 'text-[#9A8C98] bg-[#F4F0F4]',
    estudo: 'text-[#A9927D] bg-[#F4EFEB]',
  };
  const categoryIcons = {
    pessoal: <Heart size={14} />,
    trabalho: <Briefcase size={14} />,
    saude: <Droplets size={14} />,
    estudo: <BookOpen size={14} />,
  };

  const themeColors = darkMode
    ? 'bg-[#1C211F] text-[#E3EAE4]'
    : 'bg-[#F9FAF8] text-[#3A453D]';

  return (
    <div
      className={`min-h-screen w-full flex justify-center font-sans ${
        darkMode ? 'bg-black' : 'bg-[#EAECE9]'
      }`}
    >
      <div
        className={`w-full max-w-md ${themeColors} relative overflow-hidden flex flex-col shadow-2xl md:rounded-[3rem] md:my-4 md:border-8 md:border-[#111]`}
      >
        {/* CABEÇALHO GERAL */}
        <div className="px-6 pt-12 pb-4 flex justify-between items-center z-10">
          <div>
            <h1 className="font-serif text-2xl tracking-wide">
              {todayStr === getLocalString(selectedDate)
                ? 'Hoje'
                : selectedDate
                    .toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })
                    .replace('.', '')}
            </h1>
            <p
              className={`text-sm mt-1 ${
                darkMode ? 'text-[#8DA396]' : 'text-[#849C8A]'
              }`}
            >
              {todayStr === getLocalString(selectedDate)
                ? 'Tenha um dia tranquilo 🌿'
                : 'Planejando sementes'}
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-full transition-colors ${
              darkMode
                ? 'bg-[#2A312D] text-[#DDE5E1]'
                : 'bg-white shadow-sm text-[#4A5750] hover:bg-[#F0F5F2]'
            }`}
          >
            {darkMode ? (
              <Circle size={20} className="fill-[#DDE5E1]" />
            ) : (
              <Circle size={20} />
            )}
          </button>
        </div>

        {/* TIRA DA SEMANA */}
        {(activeTab === 'home' || activeTab === 'moments') && (
          <div className="px-4 pb-6 flex justify-between shrink-0">
            {weekDays.map((date, i) => {
              const isSelected =
                getLocalString(date) === getLocalString(selectedDate);
              const isToday = getLocalString(date) === todayStr;
              return (
                <button
                  key={i}
                  onClick={() => selectDay(date)}
                  className={`flex flex-col items-center p-3 rounded-full min-w-[3rem] transition-all
                    ${
                      isSelected
                        ? darkMode
                          ? 'bg-[#4A5750] text-white'
                          : 'bg-[#4A5750] text-white shadow-md'
                        : darkMode
                        ? 'hover:bg-[#2A312D] text-[#8DA396]'
                        : 'hover:bg-[#F0F5F2] text-[#849C8A]'
                    }`}
                >
                  <span className="text-[10px] uppercase font-medium mb-2 opacity-80">
                    {date.toLocaleDateString('pt-BR', { weekday: 'short' })[0]}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isToday && !isSelected
                        ? darkMode
                          ? 'text-[#DDE5E1]'
                          : 'text-[#3A453D]'
                        : ''
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {isToday && (
                    <div
                      className={`w-1 h-1 rounded-full mt-1 ${
                        isSelected
                          ? 'bg-white'
                          : darkMode
                          ? 'bg-[#8DA396]'
                          : 'bg-[#4A5750]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* --- CONTEÚDO DAS ABAS --- */}
        <div className="flex-1 overflow-y-auto px-6 pb-32 scrollbar-hide">
          {/* HOME: TAREFAS */}
          {activeTab === 'home' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="font-serif text-xl mb-4">Meu Dia</h2>
              {dayTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="opacity-50">Nenhuma semente plantada.</p>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className={`mt-4 px-6 py-2 rounded-full font-medium ${
                      darkMode
                        ? 'bg-[#4A5750] text-white'
                        : 'bg-[#8DA396] text-white'
                    }`}
                  >
                    Adicionar Tarefa
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                        darkMode
                          ? 'bg-[#242B27] border-[#2E3732]'
                          : 'bg-white border-[#E6EDE8]'
                      } ${task.completed ? 'opacity-50' : ''}`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                          task.completed
                            ? 'bg-[#8DA396] text-white border-[#8DA396]'
                            : darkMode
                            ? 'border-[#4A5750]'
                            : 'border-[#A3B8AB] hover:bg-gray-50'
                        }`}
                      >
                        {task.completed && <Check size={12} />}
                      </button>
                      <span
                        className={`flex-1 text-[15px] ${
                          task.completed ? 'line-through' : ''
                        }`}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className={`opacity-50 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 ${
                          darkMode
                            ? 'text-[#8DA396] hover:text-red-400'
                            : 'text-[#A3B8AB] hover:text-red-500'
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className={`w-full py-4 border-2 border-dashed rounded-2xl opacity-60 flex items-center justify-center gap-2 hover:opacity-100 transition-opacity ${
                      darkMode ? 'border-[#4A5750]' : 'border-[#8DA396]'
                    }`}
                  >
                    <Plus size={18} /> Nova Tarefa
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CALENDÁRIO */}
          {activeTab === 'calendar' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-serif text-2xl capitalize">
                  {currentMonth.toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className={`p-2 rounded-full border ${
                      darkMode
                        ? 'border-[#2E3732] hover:bg-[#2A312D]'
                        : 'border-[#E6EDE8] hover:bg-[#F0F5F2]'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className={`p-2 rounded-full border ${
                      darkMode
                        ? 'border-[#2E3732] hover:bg-[#2A312D]'
                        : 'border-[#E6EDE8] hover:bg-[#F0F5F2]'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium mb-4 opacity-50 uppercase">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day
                  );
                  const dateString = getLocalString(dateObj);
                  const isSelected =
                    getLocalString(selectedDate) === dateString;
                  const isToday = todayStr === dateString;
                  const hasTasks = tasks.some((t) => t.date === dateString);

                  return (
                    <button
                      key={day}
                      onClick={() => selectDay(dateObj)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-2xl relative transition-all
                        ${
                          isSelected
                            ? darkMode
                              ? 'bg-[#4A5750] text-white'
                              : 'bg-[#8DA396] text-white shadow-md'
                            : darkMode
                            ? 'bg-[#242B27] hover:bg-[#2A312D]'
                            : 'bg-white hover:bg-gray-50 border border-[#E6EDE8]'
                        }
                        ${
                          isToday && !isSelected
                            ? darkMode
                              ? 'border-2 border-[#8DA396]'
                              : 'border-2 border-[#8DA396]'
                            : ''
                        }`}
                    >
                      <span className="text-sm">{day}</span>
                      {hasTasks && (
                        <div
                          className={`absolute bottom-1.5 w-1 h-1 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-[#8DA396]'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MEMÓRIAS */}
          {activeTab === 'moments' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl">Memórias</h2>
                <button
                  onClick={() => setShowMomentModal(true)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    darkMode
                      ? 'bg-[#2A312D] text-[#8DA396]'
                      : 'bg-[#F0F5F2] text-[#849C8A]'
                  }`}
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-4">
                {dayMoments.length === 0 ? (
                  <div className="text-center py-12 opacity-50">
                    Nenhum registro hoje.
                  </div>
                ) : (
                  dayMoments.map((m) => (
                    <div
                      key={m.id}
                      className={`p-5 rounded-3xl border relative group ${
                        darkMode
                          ? 'bg-[#242B27] border-[#2E3732]'
                          : 'bg-white border-[#E6EDE8] shadow-sm'
                      }`}
                    >
                      <div className="text-3xl mb-3">{m.mood}</div>
                      <p className="mb-3 leading-relaxed text-[15px]">
                        {m.text}
                      </p>
                      {m.image && (
                        <img
                          src={m.image}
                          alt="Momento"
                          className="rounded-2xl w-full object-cover max-h-64 mt-2 border border-black/5"
                        />
                      )}
                      <button
                        onClick={() => deleteMoment(m.id)}
                        className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CADERNO (NOTAS) */}
          {activeTab === 'journal' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl">Caderno</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => createNewNote('text')}
                    className={`p-2.5 rounded-full transition-colors ${
                      darkMode
                        ? 'bg-[#4A5750] text-[#E3EAE4]'
                        : 'bg-[#8DA396] text-white shadow-sm'
                    }`}
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    onClick={() => createNewNote('list')}
                    className={`p-2.5 rounded-full border transition-colors ${
                      darkMode
                        ? 'border-[#4A5750] text-[#8DA396]'
                        : 'border-[#E6EDE8] text-[#8DA396] bg-white'
                    }`}
                  >
                    <ListTodo size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <div className="text-center py-12 opacity-50">
                    Seu caderno está vazio.
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => setActiveNote(note)}
                      className={`p-5 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] ${
                        darkMode
                          ? 'bg-[#242B27] border-[#2E3732]'
                          : 'bg-white border-[#E6EDE8] shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between mb-2 items-start">
                        <h3 className="font-medium text-lg">
                          {note.title || 'Sem título'}
                        </h3>
                        {note.type === 'list' && (
                          <ListTodo size={16} className="opacity-40" />
                        )}
                      </div>
                      <p className="text-sm opacity-60 line-clamp-2 leading-relaxed">
                        {note.type === 'list'
                          ? note.content.replace(/\[x\]|\[X\]|\[\]/g, '•')
                          : note.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* BIBLIOTECA */}
          {activeTab === 'library' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl">Biblioteca</h2>
                <button
                  onClick={() => setShowBookModal(true)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    darkMode
                      ? 'bg-[#2A312D] text-[#8DA396]'
                      : 'bg-[#F0F5F2] text-[#849C8A]'
                  }`}
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-4">
                {books.length === 0 ? (
                  <div className="text-center py-12 opacity-50">
                    Sua estante está vazia.
                  </div>
                ) : (
                  ['lendo', 'quero ler', 'lido'].map((statusG) => {
                    const groupBooks = books.filter(
                      (b) => b.status === statusG
                    );
                    if (groupBooks.length === 0) return null;
                    return (
                      <div key={statusG} className="mb-6">
                        <h3
                          className={`text-xs font-medium uppercase tracking-wider mb-3 ${
                            darkMode ? 'text-[#8DA396]' : 'text-[#849C8A]'
                          }`}
                        >
                          {statusG}
                        </h3>
                        <div className="space-y-3">
                          {groupBooks.map((book) => (
                            <div
                              key={book.id}
                              className={`p-4 rounded-[1.5rem] flex items-center justify-between border ${
                                darkMode
                                  ? 'bg-[#242B27] border-[#2E3732]'
                                  : 'bg-white border-[#E6EDE8] shadow-sm'
                              }`}
                            >
                              <div className="flex-1 pr-4">
                                <h4 className="font-medium text-[15px] truncate">
                                  {book.title}
                                </h4>
                                <p className="text-xs mt-1 opacity-60 truncate">
                                  {book.author || 'Autor desconhecido'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={book.status}
                                  onChange={(e) =>
                                    updateBookStatus(book.id, e.target.value)
                                  }
                                  className={`text-[10px] uppercase tracking-wider px-2 py-1.5 rounded-lg outline-none cursor-pointer border-none ${
                                    darkMode
                                      ? 'bg-[#1C211F] text-[#8DA396]'
                                      : 'bg-[#F0F5F2] text-[#849C8A]'
                                  }`}
                                >
                                  <option value="quero ler">Quero Ler</option>
                                  <option value="lendo">Lendo</option>
                                  <option value="lido">Lido</option>
                                </select>
                                <button
                                  onClick={() => deleteBook(book.id)}
                                  className="p-1.5 rounded-md opacity-40 hover:opacity-100 hover:text-red-400 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- MODAIS DE ADIÇÃO (Sobrepostos a toda a tela) --- */}

        {/* MODAL: NOVA TAREFA */}
        {showTaskModal && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowTaskModal(false)}
            />
            <div
              className={`relative w-full rounded-t-[2.5rem] p-6 animate-in slide-in-from-bottom-full duration-300 ${
                darkMode ? 'bg-[#1C211F]' : 'bg-[#F9FAF8]'
              }`}
            >
              <div className="w-12 h-1.5 rounded-full mx-auto mb-6 bg-black/10 dark:bg-white/10" />
              <form onSubmit={handleAddTask}>
                <input
                  autoFocus
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="O que vamos plantar hoje?"
                  className="w-full text-lg bg-transparent outline-none mb-6 font-medium placeholder:opacity-40"
                />
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                  {Object.keys(categoryColors).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewTaskCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-medium capitalize flex items-center gap-2 transition-all whitespace-nowrap border
                        ${
                          newTaskCategory === cat
                            ? categoryColors[cat]
                            : darkMode
                            ? 'bg-transparent border-[#2E3732] text-[#8DA396]'
                            : 'bg-transparent border-[#E6EDE8] text-[#849C8A] hover:bg-[#F0F5F2]'
                        }`}
                    >
                      {categoryIcons[cat]} {cat}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!newTaskText.trim()}
                  className={`w-full py-4 rounded-[1.5rem] font-medium transition-colors disabled:opacity-50 ${
                    darkMode
                      ? 'bg-[#DDE5E1] text-[#1C211F]'
                      : 'bg-[#4A5750] text-white'
                  }`}
                >
                  Plantar
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: NOVO MOMENTO */}
        {showMomentModal && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowMomentModal(false)}
            />
            <div
              className={`relative w-full h-[80%] rounded-t-[2.5rem] p-6 flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${
                darkMode ? 'bg-[#1C211F]' : 'bg-[#F9FAF8]'
              }`}
            >
              <div className="w-12 h-1.5 rounded-full mx-auto mb-6 bg-black/10 dark:bg-white/10 shrink-0" />
              <h3 className="font-serif text-lg mb-4 text-center">
                Registrar Momento
              </h3>
              <div className="flex-1 overflow-y-auto pb-4 scrollbar-hide">
                <form id="moment-form" onSubmit={handleAddMoment}>
                  <div className="mb-4">
                    <textarea
                      autoFocus
                      value={newMomentText}
                      onChange={(e) => setNewMomentText(e.target.value)}
                      placeholder="O que aconteceu hoje?"
                      rows="3"
                      className={`w-full p-4 rounded-[1.5rem] outline-none text-base border transition-colors resize-none ${
                        darkMode
                          ? 'bg-[#242B27] border-[#2E3732] focus:border-[#849C8A]'
                          : 'bg-white border-[#E6EDE8] focus:border-[#849C8A]'
                      }`}
                    />
                  </div>
                  <div className="mb-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium flex items-center gap-2 ${
                          darkMode ? 'text-[#8DA396]' : 'text-[#849C8A]'
                        }`}
                      >
                        <ImageIcon size={16} /> Adicionar foto
                      </span>
                      <label
                        className={`p-2 rounded-full cursor-pointer transition-colors ${
                          darkMode
                            ? 'bg-[#2A312D] text-[#8DA396] hover:bg-[#343D38]'
                            : 'bg-[#F0F5F2] text-[#849C8A] hover:bg-[#E6EDE8]'
                        }`}
                      >
                        <Camera size={20} />
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {newMomentImage && (
                      <div className="relative w-full h-40 rounded-[1.5rem] overflow-hidden group shadow-sm border border-[#E6EDE8] dark:border-[#2E3732]">
                        <img
                          src={newMomentImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setNewMomentImage(null)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mb-8">
                    <div className="flex justify-between px-2">
                      {['🌿', '🌸', '☀️', '☕', '🌧️', '📚', '🧘‍♀️'].map(
                        (emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setNewMomentMood(emoji)}
                            className={`text-2xl p-2 rounded-full transition-all ${
                              newMomentMood === emoji
                                ? darkMode
                                  ? 'bg-[#4A5750]'
                                  : 'bg-[#E6EDE8] scale-110'
                                : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100'
                            }`}
                          >
                            {emoji}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </form>
              </div>
              <div className="shrink-0 pt-2">
                <button
                  form="moment-form"
                  type="submit"
                  disabled={!newMomentText.trim() && !newMomentImage}
                  className={`w-full py-4 rounded-[1.5rem] font-medium transition-colors disabled:opacity-50 ${
                    darkMode
                      ? 'bg-[#DDE5E1] text-[#1C211F]'
                      : 'bg-[#4A5750] text-white'
                  }`}
                >
                  Guardar Memória
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: NOVO LIVRO */}
        {showBookModal && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowBookModal(false)}
            />
            <div
              className={`relative w-full rounded-t-[2.5rem] p-6 flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${
                darkMode ? 'bg-[#1C211F]' : 'bg-[#F9FAF8]'
              }`}
            >
              <div className="w-12 h-1.5 rounded-full mx-auto mb-6 bg-black/10 dark:bg-white/10 shrink-0" />
              <h3 className="font-serif text-lg mb-6 text-center">
                Adicionar Livro
              </h3>
              <form onSubmit={handleAddBook}>
                <input
                  autoFocus
                  type="text"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="Título do livro"
                  className={`w-full p-4 rounded-[1.5rem] outline-none text-sm border mb-3 transition-colors ${
                    darkMode
                      ? 'bg-[#242B27] border-[#2E3732] focus:border-[#8DA396]'
                      : 'bg-white border-[#E6EDE8] focus:border-[#849C8A]'
                  }`}
                />
                <input
                  type="text"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  placeholder="Autor (opcional)"
                  className={`w-full p-4 rounded-[1.5rem] outline-none text-sm border mb-4 transition-colors ${
                    darkMode
                      ? 'bg-[#242B27] border-[#2E3732] focus:border-[#8DA396]'
                      : 'bg-white border-[#E6EDE8] focus:border-[#849C8A]'
                  }`}
                />
                <span
                  className={`text-sm font-medium mb-3 block ${
                    darkMode ? 'text-[#8DA396]' : 'text-[#849C8A]'
                  }`}
                >
                  Status
                </span>
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                  {['quero ler', 'lendo', 'lido'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setNewBookStatus(status)}
                      className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-colors border ${
                        newBookStatus === status
                          ? darkMode
                            ? 'bg-[#4A5750] border-[#4A5750] text-[#E3EAE4]'
                            : 'bg-[#4A5750] border-[#4A5750] text-white'
                          : darkMode
                          ? 'bg-transparent border-[#2E3732] text-[#8DA396]'
                          : 'bg-transparent border-[#E6EDE8] text-[#849C8A]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!newBookTitle.trim()}
                  className={`w-full py-4 rounded-[1.5rem] font-medium transition-colors disabled:opacity-50 ${
                    darkMode
                      ? 'bg-[#DDE5E1] text-[#1C211F]'
                      : 'bg-[#4A5750] text-white'
                  }`}
                >
                  Adicionar à Biblioteca
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL TELA CHEIA: EDIÇÃO DE NOTAS */}
        {activeNote && (
          <div
            className={`absolute inset-0 z-50 flex flex-col animate-in slide-in-from-bottom duration-300 ${
              darkMode ? 'bg-[#1C211F]' : 'bg-[#F9FAF8]'
            }`}
          >
            <div
              className={`flex items-center justify-between p-4 border-b ${
                darkMode ? 'border-[#2E3732]' : 'border-[#E6EDE8]'
              }`}
            >
              <button onClick={() => setActiveNote(null)} className="p-2">
                <ChevronLeft size={24} />
              </button>
              <div className="flex gap-2">
                {activeNote.id !== 'new' && (
                  <button
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button
                  onClick={() =>
                    handleSaveNote(
                      document.getElementById('note-title').value,
                      activeNote.type === 'list'
                        ? activeNote.content
                        : document.getElementById('note-content').value,
                      activeNote.type
                    )
                  }
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    darkMode
                      ? 'bg-[#DDE5E1] text-[#1C211F]'
                      : 'bg-[#4A5750] text-white'
                  }`}
                >
                  Salvar
                </button>
              </div>
            </div>
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
              <input
                id="note-title"
                defaultValue={activeNote.title}
                placeholder="Título"
                className="text-2xl font-serif bg-transparent outline-none mb-6 placeholder:opacity-30"
              />
              {activeNote.type === 'list' ? (
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                  {activeNote.content.split('\n').map((line, index) => {
                    const isChecked =
                      line.startsWith('[x]') || line.startsWith('[X]');
                    const text = line.replace(/^\[[xX ]\]/, '').trim();
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 mb-3 group"
                      >
                        <button
                          onClick={() => {
                            const lines = activeNote.content.split('\n');
                            lines[index] = isChecked
                              ? `[] ${text}`
                              : `[x] ${text}`;
                            setActiveNote({
                              ...activeNote,
                              content: lines.join('\n'),
                            });
                          }}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                            isChecked
                              ? 'bg-[#8DA396] border-[#8DA396] text-white'
                              : darkMode
                              ? 'border-[#4A5750]'
                              : 'border-[#A3B8AB]'
                          }`}
                        >
                          {isChecked && <Check size={12} />}
                        </button>
                        <input
                          type="text"
                          value={text}
                          placeholder="Novo item"
                          onChange={(e) => {
                            const lines = activeNote.content.split('\n');
                            lines[index] = `${isChecked ? '[x]' : '[]'} ${
                              e.target.value
                            }`;
                            setActiveNote({
                              ...activeNote,
                              content: lines.join('\n'),
                            });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const lines = activeNote.content.split('\n');
                              lines.splice(index + 1, 0, '[] ');
                              setActiveNote({
                                ...activeNote,
                                content: lines.join('\n'),
                              });
                            }
                          }}
                          className={`list-item-input flex-1 bg-transparent outline-none text-[15px] ${
                            isChecked ? 'line-through opacity-50' : ''
                          }`}
                        />
                        <button
                          onClick={() => {
                            const lines = activeNote.content.split('\n');
                            lines.splice(index, 1);
                            setActiveNote({
                              ...activeNote,
                              content: lines.join('\n'),
                            });
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-400 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => {
                      const newContent = activeNote.content
                        ? `${activeNote.content}\n[] `
                        : '[] ';
                      setActiveNote({ ...activeNote, content: newContent });
                    }}
                    className={`mt-4 text-sm flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity`}
                  >
                    <Plus size={16} /> Adicionar item
                  </button>
                </div>
              ) : (
                <textarea
                  id="note-content"
                  defaultValue={activeNote.content}
                  placeholder="Escreva seus pensamentos..."
                  className="w-full flex-1 bg-transparent outline-none resize-none leading-relaxed placeholder:opacity-30"
                />
              )}
            </div>
          </div>
        )}

        {/* --- NAVEGAÇÃO INFERIOR (BOTTOM BAR) --- */}
        <div
          className={`absolute bottom-0 w-full px-6 pb-6 pt-4 rounded-b-[2.5rem] bg-gradient-to-t pointer-events-none z-20 ${
            darkMode
              ? 'from-[#1C211F] via-[#1C211F] to-transparent'
              : 'from-[#F9FAF8] via-[#F9FAF8] to-transparent'
          }`}
        >
          <div
            className={`flex justify-around items-center p-2 rounded-full shadow-lg border backdrop-blur-md pointer-events-auto ${
              darkMode
                ? 'bg-[#242B27]/90 border-[#2E3732]'
                : 'bg-white/95 border-[#E6EDE8]'
            }`}
          >
            {[
              { id: 'home', icon: Home },
              { id: 'calendar', icon: CalendarIcon },
              { id: 'moments', icon: Sparkles, isCenter: true },
              { id: 'journal', icon: BookOpen },
              { id: 'library', icon: Library },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative p-3 rounded-full transition-all duration-300
                  ${
                    tab.isCenter
                      ? `w-12 h-12 flex items-center justify-center shadow-inner ${
                          darkMode
                            ? 'bg-[#4A5750] text-[#E3EAE4]'
                            : 'bg-[#E6EDE8] text-[#3A453D]'
                        }`
                      : ''
                  }
                  ${
                    activeTab === tab.id && !tab.isCenter
                      ? darkMode
                        ? 'text-[#DDE5E1]'
                        : 'text-[#4A5750]'
                      : darkMode
                      ? 'text-[#6A7F72]'
                      : 'text-[#A3B8AB]'
                  }
                  hover:scale-110
                `}
              >
                <tab.icon
                  size={tab.isCenter ? 24 : 20}
                  strokeWidth={activeTab === tab.id ? 2.5 : 2}
                />
                {activeTab === tab.id && !tab.isCenter && (
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                      darkMode ? 'bg-[#DDE5E1]' : 'bg-[#4A5750]'
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
