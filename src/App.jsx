import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { db } from './firebase';
import { ref, onValue, push, set, remove } from "firebase/database";

// --- КОМПОНЕНТ ПОЛІВ (image_068780.jpg та image_06877d.jpg) ---
const CMDBFields = ({ env, type, data, setData, readOnly = false, parentName }) => {
    const isProd = env === 'PROD';
    const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px', marginTop: '20px' };
    const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
    const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '2px', backgroundColor: readOnly ? '#f9f9f9' : '#fff' };

    const update = (f, v) => !readOnly && setData({...data, [f]: v});

    return (
        <div style={gridStyle}>
            {/* Спільне поле Name */}
            <div style={inputGroup}>
                <label style={{fontWeight:'bold'}}><span style={{color:'red'}}>*</span> Назва (префікс {isProd ? 'PROD' : 'TEST'})</label>
                <input value={data.rawName || ''} onChange={e => update('rawName', e.target.value)} style={inputStyle} readOnly={readOnly} />
            </div>

            {isProd ? (
                // --- ПОВНИЙ СПИСОК ДЛЯ PROD ---
                <>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Менеджер сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Тип сервісу</label><input value={type === 'system' ? 'Основна система' : 'Модуль'} disabled style={inputStyle} /></div>
                    {type === 'module' && <div style={inputGroup}><label style={{fontWeight:'bold'}}>Основна система</label><input value={parentName || data.parentName || ''} disabled style={inputStyle} /></div>}
                    <div style={inputGroup}>
                        <label style={{color: 'red', fontWeight:'bold'}}>Business impact</label>
                        <select value={data.impact || ''} onChange={e => update('impact', e.target.value)} style={inputStyle} disabled={readOnly}>
                            <option value="">-- Оберіть --</option>
                            <option value="критичний">критичний</option><option value="великий">великий</option><option value="середній">середній</option><option value="незначний">незначний</option>
                        </select>
                    </div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Адміністратор сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Постачальник послуг</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Рольова модель сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    {type === 'system' && (
                        <div style={inputGroup}>
                            <label style={{fontWeight:'bold'}}>Deployment model</label>
                            <select style={inputStyle} disabled={readOnly}><option>cloud</option><option>hybrid</option><option>on-premises</option></select>
                        </div>
                    )}
                    <div style={inputGroup}>
                        <label style={{fontWeight:'bold'}}>Режим функціонування</label>
                        <select style={inputStyle} disabled={readOnly}><option>промисловий</option><option>пілотний</option><option>архівний</option><option>вилучений з експлуатації</option></select>
                    </div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Власник сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Час гарантованого функціонування</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>IT адміністратор сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Повна назва сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Опис</label><textarea style={{...inputStyle, height: '60px'}} readOnly={readOnly} onChange={e => update('desc', e.target.value)} value={data.desc || ''} /></div>
                </>
            ) : (
                // --- СПИСОК ДЛЯ PREPROD, TEST, DEV ---
                <>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Повна назва сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Тип сервісу</label><input value={type === 'system' ? 'Основна система' : 'Модуль'} disabled style={inputStyle} /></div>
                    {type === 'module' && <div style={inputGroup}><label style={{fontWeight:'bold'}}>Основна система</label><input value={parentName || data.parentName || ''} disabled style={inputStyle} /></div>}
                    <div style={inputGroup}>
                        <label style={{color: 'red', fontWeight:'bold'}}>Business impact</label>
                        <select value={data.impact || ''} onChange={e => update('impact', e.target.value)} style={inputStyle} disabled={readOnly}>
                            <option value="середній">середній</option><option value="незначний">незначний</option>
                        </select>
                    </div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Режим функціонування</label><input value={env === 'DEV' ? 'розробницький' : 'тестовий'} disabled style={inputStyle} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Час гарантованого функціонування</label><input style={inputStyle} readOnly={readOnly} /></div>
                </>
            )}
        </div>
    );
};

// --- ГОЛОВНА СТОРІНКА (DASHBOARD) ---
const Dashboard = () => {
    const [cards, setCards] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selection, setSelection] = useState({ type: 'system', env: 'PROD', parentName: '' });
    const [search, setSearch] = useState('');
    const [envFilter, setEnvFilter] = useState('ALL');
    const navigate = useNavigate();

    // ЗАВАНТАЖЕННЯ З FIREBASE
    useEffect(() => {
        const cardsRef = ref(db, 'cards');
        onValue(cardsRef, (snapshot) => {
            const val = snapshot.val();
            setCards(val ? Object.keys(val).map(k => ({ id: k, ...val[k] })) : []);
        });
    }, []);

    const filteredCards = cards
        .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        .filter(c => envFilter === 'ALL' || c.env === envFilter);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#fff', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>CMDB Enterprise ({cards.length})</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setIsModalOpen(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>+ НОВИЙ АКТИВ</button>
                    <button onClick={() => { if(window.confirm("Видалити ВСЕ?")) remove(ref(db, 'cards')) }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>ОЧИСТИТИ БАЗУ</button>
                </div>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                <input placeholder="Швидкий пошук за назвою..." style={{ padding: '10px', width: '300px', border: '1px solid #ddd', borderRadius: '4px' }} onChange={e => setSearch(e.target.value)} />
                <select onChange={e => setEnvFilter(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                    <option value="ALL">Всі середовища</option>
                    <option value="PROD">PROD</option><option value="TEST">TEST</option><option value="DEV">DEV</option><option value="PREPROD">PREPROD</option>
                </select>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <thead style={{ background: '#f4f4f4' }}>
                <tr>
                    <th style={{ textAlign: 'left', padding: '15px', borderBottom: '2px solid #ddd' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '15px', borderBottom: '2px solid #ddd' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '15px', borderBottom: '2px solid #ddd' }}>Environment</th>
                    <th style={{ textAlign: 'left', padding: '15px', borderBottom: '2px solid #ddd' }}>Functional Mode</th>
                </tr>
                </thead>
                <tbody>
                {filteredCards.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee' }} className="table-row">
                        <td onClick={() => navigate(`/view/${c.id}`)} style={{ padding: '15px', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>{c.name}</td>
                        <td style={{ padding: '15px' }}>{c.type === 'system' ? 'Основна система' : 'Модуль'}</td>
                        <td style={{ padding: '15px' }}>{c.env}</td>
                        <td style={{ padding: '15px' }}>{c.functionalMode || '—'}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* МОДАЛКА ПАРАМЕТРІВ */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', width: '450px' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '25px' }}>Параметри створення</h3>
                        <label>Тип активу:</label>
                        <select onChange={e => setSelection({ ...selection, type: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '2px solid #000' }}>
                            <option value="system">Основна система</option><option value="module">Модуль</option>
                        </select>
                        <label>Середовище:</label>
                        <select onChange={e => setSelection({ ...selection, env: e.target.value })} style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '8px', border: '2px solid #000' }}>
                            <option value="PROD">PROD</option><option value="TEST">TEST</option><option value="DEV">DEV</option><option value="PREPROD">PREPROD</option>
                        </select>
                        {selection.type === 'module' && (
                            <select onChange={e => setSelection({ ...selection, parentName: e.target.options[e.target.selectedIndex].text })} style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '8px', border: '2px solid #3b82f6' }}>
                                <option>-- Виберіть батьківську систему --</option>
                                {cards.filter(x => x.type === 'system').map(s => <option key={s.id}>{s.name}</option>)}
                            </select>
                        )}
                        <button onClick={() => { localStorage.setItem('current_selection', JSON.stringify(selection)); navigate('/create'); }} style={{ width: '100%', padding: '15px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>ПРОДОВЖИТИ</button>
                        <button onClick={() => setIsModalOpen(false)} style={{ width: '100%', marginTop: '10px', border: 'none', background: 'none', color: '#666', cursor: 'pointer' }}>Скасувати</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- СТОРІНКА СТВОРЕННЯ ---
const CreatePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ rawName: '', impact: '', functionalMode: '', desc: '' });
    const selection = JSON.parse(localStorage.getItem('current_selection') || '{}');

    const onSave = () => {
        const prefix = selection.env === 'PROD' ? 'PROD_' : 'TEST_';
        const newCard = {
            name: prefix + (formData.rawName || 'Unnamed'),
            type: selection.type,
            env: selection.env,
            parentName: selection.parentName || null,
            ...formData
        };
        // ЗАПИС У FIREBASE
        const cardsRef = ref(db, 'cards');
        push(cardsRef, newCard).then(() => navigate('/'));
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh' }}>
            <h2 style={{ borderBottom: '2px solid #3b82f6', paddingBottom: '15px', marginBottom: '30px' }}>Створення акту в середовищі: {selection.env}</h2>
            <CMDBFields env={selection.env} type={selection.type} data={formData} setData={setFormData} parentName={selection.parentName} />
            <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '30px', textAlign: 'center' }}>
                <button onClick={onSave} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '15px 60px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px', fontSize: '16px' }}>ЗБЕРЕГТИ В FIREBASE</button>
                <button onClick={() => navigate('/')} style={{ marginLeft: '20px', padding: '15px 30px', background: '#fff', border: '1px solid #ccc', cursor: 'pointer', borderRadius: '4px' }}>СКАСУВАТИ</button>
            </div>
        </div>
    );
};

// --- СТОРІНКА ПЕРЕГЛЯДУ ---
const ViewPage = () => {
    const { id } = useParams();
    const [card, setCard] = useState(null);
    useEffect(() => {
        const cardRef = ref(db, `cards/${id}`);
        onValue(cardRef, snap => setCard(snap.val()));
    }, [id]);

    if (!card) return <div style={{ padding: '100px', textAlign: 'center', fontSize: '20px' }}>Завантаження даних із хмари...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>CI Актив: {card.name}</h2>
            <CMDBFields env={card.env} type={card.type} data={card} readOnly={true} />
            <button onClick={() => window.history.back()} style={{ marginTop: '30px', padding: '12px 25px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>ПОВЕРНУТИСЯ ДО СПИСКУ</button>
        </div>
    );
};

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/create" element={<CreatePage />} />
                <Route path="/view/:id" element={<ViewPage />} />
            </Routes>
        </Router>
    );
}