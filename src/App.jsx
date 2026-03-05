import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { db } from './firebase';
import { ref, onValue, push, remove, update as fireUpdate, serverTimestamp } from "firebase/database";

/**
 * ПІДКЛЮЧЕННЯ ШРИФТУ ROBOTO
 * Забезпечує сучасний Enterprise-вигляд для всієї системи.
 */
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

/**
 * ГЛОБАЛЬНІ СТИЛІ
 */
const globalStyle = {
    fontFamily: "'Roboto', sans-serif",
    boxSizing: 'border-box',
    transition: 'all 0.2s ease-in-out'
};

const colors = {
    primary: '#2563eb',
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    textDark: '#111827',
    textGray: '#6b7280',
    border: '#e5e7eb',
    bgLight: '#f9fafb'
};

// --- ФУНКЦІЯ ЛОГУВАННЯ ІСТОРІЇ ---
const logAction = (ciName, actionType, details = "") => {
    const historyRef = ref(db, 'history');
    push(historyRef, {
        ciName: ciName,
        action: actionType,
        user: "Mykola Balyuk",
        timestamp: serverTimestamp(),
        details: details
    });
};

/**
 * MultiDropdown - компонент для мульти-вибору у фільтрах на Dashboard
 */
const MultiDropdown = ({ label, options, selected, onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} style={{ position: 'relative', minWidth: '200px' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '12px 15px',
                    background: '#fff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: '600',
                    ...globalStyle
                }}
            >
                <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                    {selected.length === options.length ? `Всі ${label}` : `${label}: ${selected.length}`}
                </span>
                <span style={{fontSize:'10px'}}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '10px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    zIndex: 2000,
                    padding: '10px',
                    maxHeight: '250px',
                    overflowY: 'auto'
                }}>
                    {options.map(opt => (
                        <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', cursor: 'pointer', fontSize: '14px', transition:'background 0.2s', ...globalStyle }}>
                            <input
                                type="checkbox"
                                checked={selected.includes(opt.value)}
                                onChange={() => onToggle(opt.value)}
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- КОМПОНЕНТ ДЕТАЛЬНИХ ПОЛІВ ---
/**
 * CMDBFields - динамічна форма, що змінюється залежно від Env та Type.
 */
const CMDBFields = ({ env, type, data, setData, readOnly = false, parentName, category }) => {
    const isProd = env === 'PROD';

    const containerStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px 48px',
        marginTop: '25px',
        padding: '30px',
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        ...globalStyle
    };

    const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };

    const labelStyle = {
        fontWeight: '700',
        fontSize: '12px',
        color: colors.textGray,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    const inputStyle = {
        padding: '12px 16px',
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: readOnly ? '#f3f4f6' : '#fff',
        color: colors.textDark,
        outline: 'none',
        ...globalStyle
    };

    const labelImpactStyle = {
        fontWeight: '800',
        color: '#000000',
        fontSize: '12px',
        textTransform: 'uppercase'
    };

    const updateField = (f, v) => {
        if (!readOnly) {
            setData(prev => ({ ...prev, [f]: v }));
        }
    };

    useEffect(() => {
        if (!isProd && !readOnly && !data.functionalMode) {
            if (env === 'DEV') updateField('functionalMode', 'розробницьке');
            else updateField('functionalMode', 'тестове');
        }
    }, [env, isProd, readOnly]);

    return (
        <div style={containerStyle}>
            {/* Рядок 1: Назва */}
            <div style={inputGroup}>
                <label style={labelStyle}><span style={{color: colors.danger}}>*</span> Name</label>
                <input
                    value={data.rawName || ''}
                    onChange={e => updateField('rawName', e.target.value)}
                    style={inputStyle}
                    readOnly={readOnly}
                    placeholder="Введіть системний ідентифікатор..."
                />
            </div>
            {/* ПУНКТ 1: URL текстове поле */}
            <div style={inputGroup}>
                <label style={labelStyle}>URL</label>
                <input
                    value={data.url || ''}
                    onChange={e => updateField('url', e.target.value)}
                    style={inputStyle}
                    readOnly={readOnly}
                    placeholder="https://..."
                />
            </div>

            {isProd ? (
                <>
                    {/* Поля для PROD-середовища */}
                    <div style={inputGroup}>
                        <label style={labelStyle}>Менеджер сервісу (Service Manager)</label>
                        <select
                            value={data.manager || ''}
                            onChange={e => updateField('manager', e.target.value)}
                            style={inputStyle}
                            disabled={readOnly}
                        >
                            <option value="">-- Оберіть менеджера --</option>
                            <option value="менеджер 1 директор">менеджер 1 директор</option>
                            <option value="менеджер 2 керівник">менеджер 2 керівник</option>
                            <option value="менеджер 3 правління">менеджер 3 правління</option>
                        </select>
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Тип сервісу (CI Type)</label>
                        <input value={type === 'system' ? 'Основна система' : 'Модуль'} disabled style={{...inputStyle}} />
                    </div>

                    {/* ПУНКТ 4: Виправлено відображення назви основної системи */}
                    {type === 'module' && (
                        <div style={inputGroup}>
                            <label style={labelStyle}>Основна система</label>
                            <input value={data.parentName || parentName || ''} disabled style={inputStyle} />
                        </div>
                    )}

                    <div style={inputGroup}>
                        <label style={labelStyle}>Бізнес-вплив (Business Impact)</label>
                        <select
                            value={data.impact || ''}
                            onChange={e => updateField('impact', e.target.value)}
                            style={inputStyle}
                            disabled={readOnly}
                        >
                            <option value="">-- Оберіть рівень --</option>
                            <option value="критичний">критичний</option>
                            <option value="великий">великий</option>
                            <option value="середній">середній</option>
                            <option value="незначний">незначний</option>
                        </select>
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Адміністратор сервісу</label>
                        <input value={data.admin || ''} onChange={e => updateField('admin', e.target.value)} style={inputStyle} readOnly={readOnly} />
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Постачальник послуг (Provider)</label>
                        <input value={data.provider || ''} onChange={e => updateField('provider', e.target.value)} style={inputStyle} readOnly={readOnly} />
                    </div>

                    {/* ПУНКТ 2: Дата введення в експлуатацію */}
                    <div style={inputGroup}>
                        <label style={labelStyle}>Дата введення в експлуатацію</label>
                        <input
                            type="date"
                            value={data.commissioningDate || ''}
                            onChange={e => updateField('commissioningDate', e.target.value)}
                            style={inputStyle}
                            readOnly={readOnly}
                        />
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Дата актуалізації змін</label>
                        <input
                            value={data.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'Немає даних'}
                            disabled
                            style={{...inputStyle, backgroundColor: '#f0f0f0'}}
                        />
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>RTO</label>
                        <input
                            value={data.rto || ''}
                            onChange={e => updateField('rto', e.target.value)}
                            style={inputStyle}
                            readOnly={readOnly}
                        />
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>RPO</label>
                        <input
                            value={data.rpo || ''}
                            onChange={e => updateField('rpo', e.target.value)}
                            style={inputStyle}
                            readOnly={readOnly}
                        />
                    </div>

                    {/* ПУНКТ 3: Розташування (тільки PROD і не для External) */}
                    {(category || data?.category) !== 'External ICT Service' && (
                        <div style={inputGroup}>
                            <label style={labelStyle}>Розташування (Location)</label>
                            <input
                                value={data.location || ''}
                                onChange={e => updateField('location', e.target.value)}
                                style={inputStyle}
                                readOnly={readOnly}
                            />
                        </div>
                    )}

                    <div style={inputGroup}>
                        <label style={labelStyle}>Рольова модель сервісу</label>
                        <input value={data.roleModel || ''} onChange={e => updateField('roleModel', e.target.value)} style={inputStyle} readOnly={readOnly} />
                    </div>

                    {type === 'system' && (category || data?.category) !== 'External ICT Service' && (
                        <div style={inputGroup}>
                            <label style={labelStyle}>Модель розгортання (Deployment)</label>
                            <select
                                value={data?.deployment || ''}
                                onChange={e => updateField('deployment', e.target.value)}
                                style={inputStyle}
                                disabled={readOnly}
                            >
                                <option value="">-- Оберіть модель --</option>
                                <option value="cloud">Cloud</option>
                                <option value="hybrid">Hybrid</option>
                                <option value="on-premises">On-premises</option>
                            </select>
                        </div>
                    )}

                    <div style={inputGroup}>
                        <label style={labelStyle}>Режим функціонування</label>
                        <select value={data.functionalMode || ''} onChange={e => updateField('functionalMode', e.target.value)} style={inputStyle} disabled={readOnly}>
                            <option value="промисловий">промисловий</option>
                            <option value="пілотний">пілотний</option>
                            <option value="архівний">архівний</option>
                            <option value="вилучений">вилучений з експлуатації</option>
                        </select>
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Власник сервісу</label>
                        <input value={data.owner || ''} onChange={e => updateField('owner', e.target.value)} style={inputStyle} readOnly={readOnly} />
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Час гарантованого функціонування</label>
                        <input value={data.uptime || ''} onChange={e => updateField('uptime', e.target.value)} style={inputStyle} readOnly={readOnly} />
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>IT-адміністратор сервісу</label>
                        <input value={data.itAdmin || ''} onChange={e => updateField('itAdmin', e.target.value)} style={inputStyle} readOnly={readOnly} />
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Повна назва сервісу</label>
                        <input value={data.fullName || ''} onChange={e => updateField('fullName', e.target.value)} style={inputStyle} readOnly={readOnly} />
                    </div>

                    <div style={{...inputGroup, gridColumn: 'span 2'}}>
                        <label style={labelStyle}>Опис та технічні примітки</label>
                        <textarea
                            value={data.desc || ''}
                            onChange={e => updateField('desc', e.target.value)}
                            style={{...inputStyle, height: '100px', resize: 'vertical'}}
                            readOnly={readOnly}
                        />
                    </div>
                </>
            ) : (
                <>
                    {/* Поля для TEST / DEV / PREPROD */}
                    <div style={inputGroup}>
                        <label style={labelStyle}>Повна назва сервісу</label>
                        <input value={data.fullName || ''} onChange={e => updateField('fullName', e.target.value)} style={inputStyle} readOnly={readOnly} />
                    </div>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Тип сервісу</label>
                        <input value={type === 'system' ? 'Основна система' : 'Модуль'} disabled style={inputStyle} />
                    </div>
                    {/* ПУНКТ 4: Виправлено відображення назви основної системи */}
                    {type === 'module' && (
                        <div style={inputGroup}>
                            <label style={labelStyle}>Основна система</label>
                            <input value={data.parentName || parentName || ''} disabled style={inputStyle} />
                        </div>
                    )}
                    <div style={inputGroup}>
                        <label style={labelStyle}>Дата актуалізації змін</label>
                        <input
                            value={data.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'Немає даних'}
                            disabled
                            style={{...inputStyle, backgroundColor: '#f0f0f0'}}
                        />
                    </div>
                    <div style={inputGroup}>
                        <label style={labelStyle}>RTO</label>
                        <input value={data.rto || ''} onChange={e => updateField('rto', e.target.value)} style={inputStyle} readOnly={readOnly} />
                    </div>
                    <div style={inputGroup}>
                        <label style={labelStyle}>RPO</label>
                        <input value={data.rpo || ''} onChange={e => updateField('rpo', e.target.value)} style={inputStyle} readOnly={readOnly} />
                    </div>
                    <div style={inputGroup}>
                        <label style={labelImpactStyle}>Бізнес-вплив (Business Impact)</label>
                        <select value={data.impact || ''} onChange={e => updateField('impact', e.target.value)} style={inputStyle} disabled={readOnly}>
                            <option value="середній">великий</option>
                            <option value="великий">середній</option>
                            <option value="незначний">незначний</option>
                        </select>
                    </div>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Режим функціонування (Авто)</label>
                        <input value={data.functionalMode || ''} disabled style={{...inputStyle, backgroundColor: '#f0f0f0'}} />
                    </div>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Час гарантованого функціонування</label>
                        <input value={data.uptime || ''} onChange={e => updateField('uptime', e.target.value)} style={inputStyle} readOnly={readOnly} />
                    </div>
                </>
            )}
        </div>
    );
};

// --- СТОРІНКА ПЕРЕГЛЯДУ ТА РЕДАГУВАННЯ ---
const ViewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [card, setCard] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [tempData, setTempData] = useState(null);
    const [relatedModules, setRelatedModules] = useState([]);
    const [isModulesOpen, setIsModulesOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    useEffect(() => {
        const cardRef = ref(db, `cards/${id}`);
        const unsubscribe = onValue(cardRef, (snap) => {
            const val = snap.val();
            if (val) {
                setCard(val);
                setTempData(val);

                if (val.type === 'system') {
                    const allCardsRef = ref(db, 'cards');
                    onValue(allCardsRef, (allSnap) => {
                        const allData = allSnap.val();
                        if (allData) {
                            const filtered = Object.keys(allData)
                                .map(k => ({ id: k, ...allData[k] }))
                                .filter(c => c.type === 'module' && (c.parentName === val.name || c.parentName === val.rawName));
                            setRelatedModules(filtered);
                        }
                    });
                }

                const histRef = ref(db, 'history');
                onValue(histRef, (hSnap) => {
                    const hData = hSnap.val();
                    if (hData) {
                        const hList = Object.keys(hData)
                            .map(k => ({ id: k, ...hData[k] }))
                            .filter(h => h.ciName === val.name)
                            .sort((a, b) => b.timestamp - a.timestamp);
                        setHistory(hList);
                    }
                });
            }
        });
        return () => unsubscribe();
    }, [id]);

    const handleUpdate = () => {
        if (!tempData.rawName) return alert("Назва обов'язкова!");

        const updatedData = {
            ...tempData,
            updatedAt: Date.now() // Встановлюємо дату актуалізації
        };

        fireUpdate(ref(db, `cards/${id}`), updatedData).then(() => {
            logAction(card.name, "РЕДАГУВАННЯ", "Оновлено дані та дату актуалізації");
            setEditMode(false);
            alert("Картку успішно оновлено в Firebase!");
        });
    };

    const handleDelete = () => {
        if (window.confirm("Ви дійсно бажаєте безповоротно видалити цю карточку?")) {
            logAction(card.name, "ВИДАЛЕННЯ", "Вилучено з реєстру");
            remove(ref(db, `cards/${id}`)).then(() => navigate('/'));
        }
    };

    if (!card || !tempData) return (
        <div style={{...globalStyle, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <h2>Синхронізація з Firebase...</h2>
        </div>
    );

    return (
        <div style={{ ...globalStyle, backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '50px 20px' }}>
            <div style={{ backgroundColor: '#fff', padding: '45px', maxWidth: '1250px', margin: '0 auto', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f3f4f6', paddingBottom: '25px', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: colors.textDark, fontSize: '28px', fontWeight: '900' }}>CI Картка: {card.name}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} style={{ ...globalStyle, background: colors.primary, color: '#fff', border: 'none', padding: '12px 30px', cursor: 'pointer', borderRadius: '8px', fontWeight: '700' }}>
                            {isHistoryOpen ? "ЗАКРИТИ ІСТОРІЮ" : "ІСТОРІЯ"}
                        </button>
                        {!editMode ? (
                            <button onClick={() => setEditMode(true)} style={{ ...globalStyle, background: colors.warning, color: '#fff', border: 'none', padding: '12px 30px', cursor: 'pointer', borderRadius: '8px', fontWeight: '700' }}>РЕДАГУВАТИ</button>
                        ) : (
                            <button onClick={handleUpdate} style={{ ...globalStyle, background: colors.success, color: '#fff', border: 'none', padding: '12px 30px', cursor: 'pointer', borderRadius: '8px', fontWeight: '700' }}>ЗБЕРЕГТИ ЗМІНИ</button>
                        )}
                        <button onClick={handleDelete} style={{ ...globalStyle, background: colors.danger, color: '#fff', border: 'none', padding: '12px 30px', cursor: 'pointer', borderRadius: '8px', fontWeight: '700' }}>ВИДАЛИТИ CI</button>
                    </div>
                </div>

                {isHistoryOpen ? (
                    <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                        <h3 style={{ marginBottom: '20px', fontWeight: '800' }}>ЖУРНАЛ ПОДІЙ</h3>
                        {history.length > 0 ? history.map(item => (
                            <div key={item.id} style={{ padding: '15px', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                                <b>{new Date(item.timestamp).toLocaleString()}</b> —
                                <span style={{ color: colors.primary, fontWeight: '700' }}> {item.action} </span>
                                користувачем <i>{item.user}</i>. <span style={{ color: colors.textDark, fontWeight: '500' }}>{item.details}</span>
                            </div>
                        )) : <p>Історія змін відсутня.</p>}
                    </div>
                ) : (
                    <CMDBFields
                        env={card.env}
                        type={card.type}
                        data={tempData}
                        setData={setTempData}
                        readOnly={!editMode}
                        parentName={card.parentName}
                        category={card.category}
                    />
                )}

                {/* Accordion для модулів */}
                {!isHistoryOpen && card.type === 'system' && card.env === 'PROD' && (
                    <div style={{ marginTop: '50px', border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                        <div
                            onClick={() => setIsModulesOpen(!isModulesOpen)}
                            style={{ padding: '20px 25px', background: '#f8fafc', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', color: colors.textDark }}
                        >
                            <span>📦 ПОВ'ЯЗАНІ МОДУЛІ СИСТЕМИ ({relatedModules.length})</span>
                            <span style={{fontSize: '20px'}}>{isModulesOpen ? '−' : '+'}</span>
                        </div>
                        {isModulesOpen && (
                            <div style={{ padding: '20px', background: '#fff' }}>
                                {relatedModules.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                                        {relatedModules.map(m => (
                                            <div key={m.id} onClick={() => { navigate(`/view/${m.id}`); setIsModulesOpen(false); }}
                                                 style={{ padding: '18px', border: `1px solid ${colors.border}`, borderRadius: '10px', cursor: 'pointer', color: colors.primary, fontWeight: '700', background: '#fff', transition: 'transform 0.2s' }}
                                                 onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; }}
                                                 onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                                📄 {m.name}
                                                <div style={{fontSize:'11px', color:'#9ca3af', marginTop:'5px'}}>Натисніть для переходу до модуля</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '30px', textAlign: 'center', color: colors.textGray, fontStyle: 'italic' }}>Ця система не має зареєстрованих дочірніх модулів.</div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginTop: '60px', borderTop: `1px solid ${colors.border}`, paddingTop: '30px' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{ ...globalStyle, padding: '15px 45px', cursor: 'pointer', background: colors.textDark, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600' }}
                    >
                        ← ПОВЕРНУТИСЯ ДО DASHBOARD
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- ГОЛОВНА ПАНЕЛЬ DASHBOARD ---
const Dashboard = () => {
    const [activeMenu, setActiveMenu] = useState(true);
    const [selectedSub, setSelectedSub] = useState('External ICT Service');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selection, setSelection] = useState({ type: 'system', env: 'PROD', parentName: '' });
    const [cards, setCards] = useState([]);
    const navigate = useNavigate();

    const [fName, setFName] = useState('');
    const [fEnv, setFEnv] = useState(['PROD', 'TEST', 'DEV', 'PREPROD']);
    const [fType, setFType] = useState(['system', 'module']);

    useEffect(() => {
        const cardsRef = ref(db, 'cards');
        const unsubscribe = onValue(cardsRef, (snapshot) => {
            const val = snapshot.val();
            if (val) {
                const list = Object.keys(val).map(k => ({ id: k, ...val[k] }));
                setCards(list);
            } else {
                setCards([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const subs = ["External ICT Service", "Infrastructure ICT Sevice", "Business ICT Sevice", "Cybersecurity ICT Sevice"];

    const toggleFilter = (list, setList, val) => {
        setList(list.includes(val) ? list.filter(i => i !== val) : [...list, val]);
    };

    const filtered = cards
        .filter(c => c.category === selectedSub)
        .filter(c => c.name.toLowerCase().includes(fName.toLowerCase()))
        .filter(c => fEnv.includes(c.env))
        .filter(c => fType.includes(c.type));

    return (
        <div style={{ ...globalStyle, display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff' }}>

            <div style={{ background: '#fff', borderBottom: `1px solid ${colors.border}`, padding: '18px 35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '35px', height: '35px', background: colors.primary, borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: '900' }}>C</div>
                    <span style={{ fontWeight: '900', fontSize: '20px', color: colors.textDark, letterSpacing: '-0.5px' }}>CMDB</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => { if(window.confirm("Очистити базу?")) remove(ref(db, 'cards')) }} style={{ ...globalStyle, background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>ОЧИСТИТИ БАЗУ ДАНИХ</button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                <div style={{ width: '300px', background: '#f9fafb', borderRight: `1px solid ${colors.border}`, padding: '30px 0' }}>
                    <div
                        style={{ padding: '15px 30px', cursor: 'pointer', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px', color: colors.textDark, backgroundColor: '#f3f4f6', marginBottom: '10px' }}
                        onClick={() => setActiveMenu(!activeMenu)}
                    >
                        📁 IT SERVICE {activeMenu ? '▼' : '▶'}
                    </div>
                    {activeMenu && subs.map(s => (
                        <div
                            key={s}
                            onClick={() => setSelectedSub(s)}
                            style={{
                                padding: '12px 65px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                color: selectedSub === s ? colors.primary : colors.textGray,
                                backgroundColor: selectedSub === s ? '#eff6ff' : 'transparent',
                                borderLeft: selectedSub === s ? `4px solid ${colors.primary}` : 'none',
                                fontWeight: selectedSub === s ? '700' : '400',
                                transition: 'all 0.15s'
                            }}
                        >
                            📄 {s}
                        </div>
                    ))}
                </div>

                <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>

                    <div style={{ background: '#f9fafb', padding: '30px', borderRadius: '16px', border: `1px solid ${colors.border}`, marginBottom: '40px' }}>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                style={{ ...globalStyle, background: colors.primary, color: '#fff', border: 'none', padding: '12px 35px', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)' }}
                            >
                                + NEW
                            </button>

                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <input
                                    placeholder="Швидкий пошук CI..."
                                    style={{ ...globalStyle, padding: '12px 18px', width: '100%', border: `1px solid ${colors.border}`, borderRadius: '10px', outline: 'none', fontSize: '14px' }}
                                    onChange={e => setFName(e.target.value)}
                                />
                            </div>

                            <MultiDropdown
                                label="Env"
                                options={[{value:'PROD', label:'PROD'}, {value:'TEST', label:'TEST'}, {value:'DEV', label:'DEV'}, {value:'PREPROD', label:'PREPROD'}]}
                                selected={fEnv}
                                onToggle={v => toggleFilter(fEnv, setFEnv, v)}
                            />

                            <MultiDropdown
                                label="Type"
                                options={[{value:'system', label:'Система'}, {value:'module', label:'Модуль'}]}
                                selected={fType}
                                onToggle={v => toggleFilter(fType, setFType, v)}
                            />

                            <div style={{ fontWeight: '800', color: colors.textDark, borderLeft: `2px solid ${colors.border}`, paddingLeft: '20px' }}>
                                Всього: <span style={{color: colors.primary}}>{filtered.length}</span>
                            </div>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ textAlign: 'left', padding: '20px 25px', fontSize: '11px', color: colors.textGray, textTransform: 'uppercase', letterSpacing: '0.1em' }}>CI NAME</th>
                            <th style={{ textAlign: 'left', padding: '20px 25px', fontSize: '11px', color: colors.textGray, textTransform: 'uppercase', letterSpacing: '0.1em' }}>TYPE</th>
                            <th style={{ textAlign: 'left', padding: '20px 25px', fontSize: '11px', color: colors.textGray, textTransform: 'uppercase', letterSpacing: '0.1em' }}>ICT CATEGORY</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map(c => (
                            <tr
                                key={c.id}
                                style={{ background: '#fff', borderRadius: '12px', cursor: 'pointer', transition: 'transform 0.1s' }}
                                onClick={() => navigate(`/view/${c.id}`)}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fdfdfd'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.03)'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.boxShadow  = 'none'; }}
                            >
                                <td style={{ padding: '20px 25px', color: colors.primary, fontWeight: '800', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', border: `1px solid ${colors.border}`, borderRight: 'none' }}>{c.name}</td>
                                <td style={{ padding: '20px 25px', fontSize: '14px', borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>{c.type === 'system' ? 'Основна система' : 'Модуль'}</td>
                                <td style={{ padding: '20px 25px', fontSize: '14px', borderTopRightRadius: '12px', borderBottomRightRadius: '12px', border: `1px solid ${colors.border}`, borderLeft: 'none' }}>{c.category}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: '#fff', padding: '55px', borderRadius: '24px', width: '550px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '26px', fontWeight: '900', color: colors.textDark, letterSpacing: '-1px' }}>Нова карточка</h3>

                        <div style={{marginBottom: '30px'}}>
                            <label style={{fontSize: '13px', color: colors.textGray, marginBottom: '10px', display: 'block', fontWeight: '700'}}>ОБЕРІТЬ ТИП</label>
                            <select
                                onChange={e => setSelection({...selection, type: e.target.value})}
                                style={{ ...globalStyle, width: '100%', padding: '16px', borderRadius: '12px', border: `2px solid ${colors.border}`, fontSize: '16px', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="system">Основна система</option>
                                <option value="module">Модуль</option>
                            </select>
                        </div>

                        <div style={{marginBottom: '30px'}}>
                            <label style={{fontSize: '13px', color: colors.textGray, marginBottom: '10px', display: 'block', fontWeight: '700'}}>СЕРЕДОВИЩЕ РОЗГОРТАННЯ</label>
                            <select
                                onChange={e => setSelection({...selection, env: e.target.value})}
                                style={{ ...globalStyle, width: '100%', padding: '16px', borderRadius: '12px', border: `2px solid ${colors.border}`, fontSize: '16px', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="PROD">PROD</option>
                                <option value="TEST">TEST</option>
                                <option value="DEV">DEV</option>
                                <option value="PREPROD">PREPROD</option>
                            </select>
                        </div>

                        {selection.type === 'module' && (
                            <div style={{marginBottom: '40px'}}>
                                <label style={{fontSize: '13px', color: colors.textGray, marginBottom: '10px', display: 'block', fontWeight: '700'}}>ПРИВ'ЯЗКА ДО СИСТЕМИ</label>
                                <select
                                    onChange={e => setSelection({...selection, parentName: e.target.value})}
                                    style={{ ...globalStyle, width: '100%', padding: '16px', borderRadius: '12px', border: `2px solid ${colors.primary}`, fontSize: '16px', outline: 'none' }}
                                >
                                    <option value="">-- Оберіть батьківську систему --</option>
                                    {cards.filter(x => x.type === 'system').map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={() => { localStorage.setItem('current_selection', JSON.stringify({...selection, category: selectedSub})); navigate('/create'); }}
                            style={{ ...globalStyle, width: '100%', padding: '18px', background: colors.primary, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '16px', boxShadow: `0 10px 15px -3px rgba(37, 99, 235, 0.4)` }}
                        >
                            ПЕРЕЙТИ ДО ЗАПОВНЕННЯ ФОРМИ
                        </button>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ ...globalStyle, width: '100%', marginTop: '20px', background: 'none', border: 'none', color: colors.textGray, cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                        >
                            СКАСУВАТИ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- СТОРІНКА СТВОРЕННЯ ---
const CreatePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        rawName: '', manager: '', admin: '', roleModel: '', uptime: '',
        owner: '', itAdmin: '', fullName: '', provider: '', desc: '', impact: '', deployment: '',
        url: '', commissioningDate: '', location: '', rto: '', rpo: '', updatedAt: Date.now()
    });
    const selection = JSON.parse(localStorage.getItem('current_selection') || '{}');

    const handleSave = () => {
        if (!formData.rawName) return alert("Помилка: Назва обов'язкова!");
        const prefix = selection.env === 'PROD' ? 'PROD_' : 'TEST_';
        const finalData = {
            ...formData,
            name: prefix + formData.rawName,
            type: selection.type,
            env: selection.env,
            category: selection.category,
            parentName: selection.parentName || null,
            updatedAt: Date.now()
        };
        push(ref(db, 'cards'), finalData).then(() => {
            logAction(finalData.name, "СТВОРЕННЯ", "Додано нову карточку");
            navigate('/');
        });
    };

    return (
        <div style={{ ...globalStyle, backgroundColor: colors.bgLight, minHeight: '100vh', padding: '60px 20px' }}>
            <div style={{ backgroundColor: '#fff', padding: '50px', maxWidth: '1150px', margin: '0 auto', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                <div style={{ borderLeft: `6px solid ${colors.primary}`, paddingLeft: '25px', marginBottom: '45px' }}>
                    <h2 style={{ margin: 0, color: colors.textDark, fontSize: '32px', fontWeight: '900' }}>
                        РЕЄСТРАЦІЯ НОВОЇ КАРТОЧКИ: {selection.env}
                    </h2>
                    <p style={{ color: colors.textGray, marginTop: '10px', fontSize: '16px' }}>Категорія: {selection.category}</p>
                </div>

                <CMDBFields
                    env={selection.env}
                    type={selection.type}
                    data={formData}
                    setData={setFormData}
                    parentName={selection.parentName}
                    category={selection.category}
                />

                <div style={{ marginTop: '70px', textAlign: 'center', borderTop: `1px solid ${colors.border}`, paddingTop: '45px' }}>
                    <button
                        onClick={handleSave}
                        style={{ ...globalStyle, background: colors.primary, color: '#fff', border: 'none', padding: '20px 100px', fontWeight: '900', cursor: 'pointer', borderRadius: '12px', fontSize: '18px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' }}
                    >
                        СТВОРИТИ
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        style={{ ...globalStyle, marginLeft: '30px', padding: '20px 50px', background: '#fff', border: `2px solid ${colors.border}`, borderRadius: '12px', cursor: 'pointer', fontWeight: '700', color: colors.textGray }}
                    >
                        СКАСУВАТИ
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- ОСНОВНИЙ КОМПОНЕНТ APP ---
export default function App() {
    return (
        <Router>
            <div style={globalStyle}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/create" element={<CreatePage />} />
                    <Route path="/view/:id" element={<ViewPage />} />
                </Routes>
            </div>
        </Router>
    );
}