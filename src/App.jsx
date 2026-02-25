import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';

// --- Компонент для полів "Основна система" ( image_06f558.jpg ) ---
const MainSystemFields = ({ env, data, setData, readOnly = false }) => {
    const isProd = env === 'PROD';
    const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px', marginTop: '20px' };
    const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
    const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '2px', backgroundColor: readOnly ? '#f9f9f9' : '#fff' };

    const setField = (field, value) => !readOnly && setData({...data, [field]: value});

    useEffect(() => {
        if (!isProd && !readOnly) {
            if (env === 'DEV') setField('functionalMode', 'розробницьке');
            else if (env === 'TEST' || env === 'PREPROD') setField('functionalMode', 'тестове');
        }
    }, [env, isProd]);

    return (
        <div style={gridStyle}>
            <div style={inputGroup}>
                <label style={{fontWeight:'bold'}}><span style={{color:'red'}}>*</span> Назва</label>
                <input placeholder={`${env}_${data.rawName || ''}`} value={data.rawName || ''} onChange={e => setField('rawName', e.target.value)} style={inputStyle} readOnly={readOnly} />
            </div>

            {isProd ? (
                <>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Менеджер сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Тип сервісу</label><input value="Основна система" disabled style={{...inputStyle, backgroundColor: '#f9f9f9'}} /></div>
                    <div style={inputGroup}>
                        <label style={{color: 'red', fontWeight:'bold'}}>Бізнес-вплив</label>
                        <select value={data.impact || ''} onChange={e => setField('impact', e.target.value)} style={inputStyle} disabled={readOnly}>
                            <option value="">-- Оберіть --</option>
                            <option value="критичний">критичний</option><option value="великий">великий</option><option value="середній">середній</option><option value="незначний">незначний</option>
                        </select>
                    </div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Адміністратор сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Постачальник послуг</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Рольова модель сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}>
                        <label style={{fontWeight:'bold'}}>Модель розгортання</label>
                        <select value={data.deployment || ''} onChange={e => setField('deployment', e.target.value)} style={inputStyle} disabled={readOnly}>
                            <option value="">-- Оберіть --</option>
                            <option value="cloud">cloud</option><option value="hybrid">hybrid</option><option value="on-premises">on-premises</option>
                        </select>
                    </div>
                    <div style={inputGroup}>
                        <label style={{fontWeight:'bold'}}>Режим функціонування</label>
                        <select value={data.functionalMode || 'промисловий'} onChange={e => setField('functionalMode', e.target.value)} style={inputStyle} disabled={readOnly}>
                            <option value="промисловий">промисловий</option><option value="пілотний">пілотний</option><option value="архівний">архівний</option><option value="вилучений з експлуатації">вилучений з експлуатації</option>
                        </select>
                    </div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Власник сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Час гарантованого функціонування</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>IT-адміністратор сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Повна назва сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Опис</label><textarea style={inputStyle} readOnly={readOnly} onChange={e => setField('desc', e.target.value)} value={data.desc || ''} /></div>
                </>
            ) : (
                <>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Повна назва сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Тип сервісу</label><input value="Основна система" disabled style={{...inputStyle, backgroundColor: '#f9f9f9'}} /></div>
                    <div style={inputGroup}>
                        <label style={{color: 'red', fontWeight:'bold'}}>Бізнес-вплив</label>
                        <select style={inputStyle} disabled={readOnly} value={data.impact || ''} onChange={e => setField('impact', e.target.value)}>
                            <option value="критичний">критичний</option><option value="великий">великий</option><option value="середній">середній</option><option value="незначний">незначний</option>
                        </select>
                    </div>
                    <div style={inputGroup}>
                        <label style={{fontWeight:'bold'}}>Режим функціонування (автоматично)</label>
                        <input value={data.functionalMode || ''} disabled style={{...inputStyle, backgroundColor: '#f9f9f9'}} />
                    </div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Час гарантованого функціонування</label><input style={inputStyle} readOnly={readOnly} /></div>
                </>
            )}
        </div>
    );
};

// --- Компонент для полів "Модуль" ( image_06f7fb.jpg ) ---
const ModuleFields = ({ env, data, setData, parentName, readOnly = false }) => {
    const isProd = env === 'PROD';
    const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px', marginTop: '20px' };
    const inputGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
    const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '2px', backgroundColor: readOnly ? '#f9f9f9' : '#fff' };

    const setField = (field, value) => !readOnly && setData({...data, [field]: value});

    useEffect(() => {
        if (!isProd && !readOnly) {
            if (env === 'DEV') setField('functionalMode', 'розробницьке');
            else if (env === 'TEST' || env === 'PREPROD') setField('functionalMode', 'тестове');
        }
    }, [env, isProd]);

    return (
        <div style={gridStyle}>
            <div style={inputGroup}>
                <label style={{fontWeight:'bold'}}><span style={{color:'red'}}>*</span> Назва</label>
                <input value={data.rawName || ''} onChange={e => setField('rawName', e.target.value)} style={inputStyle} readOnly={readOnly} />
            </div>
            <div style={inputGroup}><label style={{fontWeight:'bold'}}>Основна система</label><input value={parentName || data.parentName || ''} disabled style={{...inputStyle, backgroundColor: '#f9f9f9'}} /></div>

            {isProd ? (
                <>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Менеджер сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Тип сервісу</label><input value="Модуль" disabled style={{...inputStyle, backgroundColor: '#f9f9f9'}} /></div>
                    <div style={inputGroup}>
                        <label style={{color: 'red', fontWeight:'bold'}}>Бізнес-вплив</label>
                        <select value={data.impact || ''} onChange={e => setField('impact', e.target.value)} style={inputStyle} disabled={readOnly}>
                            <option value="критичний">критичний</option><option value="великий">великий</option><option value="середній">середній</option><option value="незначний">незначний</option>
                        </select>
                    </div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Адміністратор сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Постачальник послуг</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Рольова модель сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Режим функціонування</label><select style={inputStyle} disabled={readOnly}><option>промисловий</option><option>пілотний</option></select></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Власник сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Час гарантованого функціонування</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>IT-адміністратор сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Повна назва сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Опис</label><textarea style={inputStyle} readOnly={readOnly} onChange={e => setField('desc', e.target.value)} value={data.desc || ''} /></div>
                </>
            ) : (
                <>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Повна назва сервісу</label><input style={inputStyle} readOnly={readOnly} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Тип сервісу</label><input value="Модуль" disabled style={{...inputStyle, backgroundColor: '#f9f9f9'}} /></div>
                    <div style={inputGroup}>
                        <label style={{color: 'red', fontWeight:'bold'}}>Бізнес-вплив</label>
                        <select style={inputStyle} disabled={readOnly} value={data.impact || ''} onChange={e => setField('impact', e.target.value)}>
                            <option value="критичний">критичний</option><option value="великий">великий</option><option value="середній">середній</option><option value="незначний">незначний</option>
                        </select>
                    </div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Режим функціонування (авто)</label><input value={data.functionalMode || ''} disabled style={{...inputStyle, backgroundColor: '#f9f9f9'}} /></div>
                    <div style={inputGroup}><label style={{fontWeight:'bold'}}>Час гарантованого функціонування</label><input style={inputStyle} readOnly={readOnly} /></div>
                </>
            )}
        </div>
    );
};

// --- СТОРІНКА ПЕРЕГЛЯДУ ---
const ViewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [card, setCard] = useState(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('cmdb_cards') || '[]');
        setCard(saved.find(c => c.id.toString() === id));
    }, [id]);

    if (!card) return <div style={{padding: '50px'}}>Завантаження...</div>;

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
            <div style={{ backgroundColor: '#fff', padding: '30px', maxWidth: '1000px', margin: '0 auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2>Деталі: {card.name}</h2>
                <hr />
                {card.type === 'System'
                    ? <MainSystemFields env={card.env} data={card} readOnly={true} />
                    : <ModuleFields env={card.env} data={card} parentName={card.parentName} readOnly={true} />
                }
                <button onClick={() => navigate('/')} style={{ marginTop: '30px', padding: '10px 25px', cursor: 'pointer' }}>Назад</button>
            </div>
        </div>
    );
};

// --- DASHBOARD ---
const Dashboard = () => {
    const [activeService, setActiveService] = useState(true);
    const [selectedSub, setSelectedSub] = useState('External ICT Service');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selection, setSelection] = useState({ type: 'system', env: 'PROD', parentId: '', parentName: '' });
    const [search, setSearch] = useState('');
    const [envFilter, setEnvFilter] = useState('ALL');

    const [cards, setCards] = useState(() => {
        const saved = localStorage.getItem('cmdb_cards');
        return saved ? JSON.parse(saved) : [];
    });

    const navigate = useNavigate();
    const services = ["External ICT Service", "Infrastructure ICT Sevice", "Business ICT Sevice", "Cybersecurity ICT Sevice"];
    const mainSystems = cards.filter(c => c.type === "System");

    const filteredCards = cards
        .filter(c => c.category === selectedSub)
        .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
        .filter(c => envFilter === 'ALL' || c.env === envFilter);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial', backgroundColor: '#fff' }}>
            <div style={{ background: '#f4f4f4', borderBottom: '1px solid #ccc', padding: '10px 20px', fontWeight: 'bold' }}>CMDB Dashboard</div>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div style={{ width: '250px', background: '#f9f9f9', borderRight: '1px solid #ddd', padding: '10px 0' }}>
                    <div style={{ padding: '8px 20px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setActiveService(!activeService)}>
                        📁 IT Service {activeService ? '▼' : '▶'}
                    </div>
                    {activeService && services.map(s => (
                        <div key={s} onClick={() => setSelectedSub(s)}
                             style={{ padding: '6px 45px', fontSize: '13px', cursor: 'pointer', color: selectedSub === s ? '#3b82f6' : '#555', backgroundColor: selectedSub === s ? '#eef2ff' : 'transparent' }}>
                            📄 {s}
                        </div>
                    ))}
                </div>
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                        <button onClick={() => setIsModalOpen(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '4px', cursor: 'pointer', fontWeight:'bold' }}>+ Новий</button>
                        <input placeholder="Швидкий пошук..." style={{padding: '8px', width: '200px', border:'1px solid #ddd'}} onChange={e => setSearch(e.target.value)} />
                        <select onChange={e => setEnvFilter(e.target.value)} style={{padding: '8px', border:'1px solid #ddd'}}>
                            <option value="ALL">Всі середовища</option>
                            <option value="PROD">PROD</option><option value="TEST">TEST</option><option value="DEV">DEV</option><option value="PREPROD">PREPROD</option>
                        </select>
                        <div style={{marginLeft:'auto'}}>Всього в категорії: <b>{filteredCards.length}</b></div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#fcfcfc', borderBottom: '2px solid #eee' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                            <th style={{ textAlign: 'left', padding: '12px' }}>CI Type</th>
                            <th style={{ textAlign: 'left', padding: '12px' }}>Опис</th>
                            <th style={{ textAlign: 'left', padding: '12px' }}>Тип ICT</th>
                            <th style={{ textAlign: 'left', padding: '12px' }}>Режим</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredCards.map((card, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                <td onClick={() => navigate(`/view/${card.id}`)} style={{ padding: '12px', color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}>{card.name}</td>
                                <td style={{ padding: '12px' }}>{card.type === 'System' ? 'Система' : 'Модуль'}</td>
                                <td style={{ padding: '12px' }}>{card.desc || '—'}</td>
                                <td style={{ padding: '12px' }}>{card.category}</td>
                                <td style={{ padding: '12px' }}>{card.functionalMode}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* МОДАЛКА ВИБОРУ */}
                    {isModalOpen && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', width: '450px' }}>
                                <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Параметри нової картки</h2>
                                <div style={{display: 'flex', border: '1px solid #000', borderRadius:'25px', overflow:'hidden', marginBottom: '20px'}}>
                                    <button onClick={() => setSelection({...selection, type: 'system'})} style={{flex: 1, padding: '10px', border:'none', background: selection.type === 'system' ? '#f59e0b' : '#fff', fontWeight:'bold'}}>Основна система</button>
                                    <button onClick={() => setSelection({...selection, type: 'module'})} style={{flex: 1, padding: '10px', border:'none', background: selection.type === 'module' ? '#f59e0b' : '#fff', fontWeight:'bold'}}>Модуль</button>
                                </div>
                                {selection.type === 'module' && (
                                    <select onChange={(e) => {
                                        const sys = mainSystems.find(c => c.id.toString() === e.target.value);
                                        setSelection({...selection, parentId: e.target.value, parentName: sys?.name});
                                    }} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius:'15px', border:'2px solid #000' }}>
                                        <option value="">Оберіть батьківську систему ▼</option>
                                        {mainSystems.map(sys => <option key={sys.id} value={sys.id}>{sys.name}</option>)}
                                    </select>
                                )}
                                <select value={selection.env} onChange={(e) => setSelection({...selection, env: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius:'15px', border:'2px solid #000' }}>
                                    <option value="PROD">PROD</option><option value="TEST">TEST</option><option value="DEV">DEV</option><option value="PREPROD">PREPROD</option>
                                </select>
                                <button onClick={() => { localStorage.setItem('current_selection', JSON.stringify({...selection, category: selectedSub})); navigate('/create'); }} style={{ width: '100%', background: '#3b82f6', color: '#fff', padding: '12px', border: 'none', borderRadius:'4px', fontWeight: 'bold', cursor:'pointer' }}>ПЕРЕЙТИ ДО ЗАПОВНЕННЯ</button>
                                <button onClick={()=>setIsModalOpen(false)} style={{width:'100%', background:'none', border:'none', color:'#666', marginTop:'10px', cursor:'pointer'}}>Скасувати</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- СТОРІНКА СТВОРЕННЯ ---
const CreatePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ rawName: '', desc: '', impact: '', functionalMode: '', deployment: '' });
    const selection = JSON.parse(localStorage.getItem('current_selection') || '{}');

    const onSave = () => {
        const prefix = selection.env === 'PROD' ? 'PROD_' : 'TEST_';
        const newCard = {
            id: Date.now(),
            name: prefix + (formData.rawName || 'Без назви'),
            type: selection.type === 'module' ? 'Module' : 'System',
            env: selection.env,
            category: selection.category,
            parentName: selection.parentName || null,
            ...formData
        };
        const saved = JSON.parse(localStorage.getItem('cmdb_cards') || '[]');
        localStorage.setItem('cmdb_cards', JSON.stringify([...saved, newCard]));
        navigate('/');
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '40px' }}>
            <div style={{ backgroundColor: '#fff', padding: '30px', maxWidth: '1000px', margin: '0 auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{borderBottom:'1px solid #eee', paddingBottom:'10px'}}>Створення активу: {selection.env}</h2>
                {selection.type === 'system' ? <MainSystemFields env={selection.env} data={formData} setData={setFormData} /> : <ModuleFields env={selection.env} data={formData} setData={setFormData} parentName={selection.parentName} />}
                <div style={{ marginTop: '30px', textAlign: 'center', borderTop:'1px solid #eee', paddingTop:'20px' }}>
                    <button onClick={onSave} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 40px', fontWeight: 'bold', borderRadius:'4px', cursor:'pointer' }}>ЗБЕРЕГТИ В CMDB</button>
                    <button onClick={() => navigate('/')} style={{ marginLeft: '10px', padding: '12px 25px', background:'#fff', border:'1px solid #ccc', cursor:'pointer' }}>СКАСУВАТИ</button>
                </div>
            </div>
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