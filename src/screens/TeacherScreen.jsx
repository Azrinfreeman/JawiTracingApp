import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import { validateLetter } from '../content/validateContent.js';
import { AudioReviewPanel } from '../components/AudioReviewPanel.jsx';
import { FitDialog } from '../components/FitDialog.jsx';
import { PagedRecords, DetailPages, recordFields } from '../components/PagedRecords.jsx';
import { matchAwards } from '../game/scoring.js';
import { LetterModelGlyph } from '../components/LetterModelGlyph.jsx';
import { downloadJson as download } from '../platform/download.js';
function CopyThumbnail({ copy }) {
  return <svg viewBox="0 0 1000 1000" className="copy-thumbnail" role="img" aria-label={`Salinan ${copy.letterId} untuk pemerhatian guru`}>{copy.ink.map((line,i) => <path key={i} d={line.map((p,j) => `${j ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')} fill="none" stroke="#276252" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>)}</svg>;
}
const help = [
  ['Semakan suara', 'Semak kejelasan sebutan, kelajuan dan kesesuaian untuk murid. Butang Dengar dan Rakaman seterusnya tidak memberi kelulusan. Semakan guru Jawi bernama belum direkodkan; rekod kelulusan pemilik projek terdapat dalam butiran huruf.'],
  ['Jejak Ceria', 'Laluan diisi dengan warna sebagai bantuan. Jika tersasar, kemajuan berhenti sekejap dan boleh disambung tanpa memadam kerja yang diterima. Pad titik ialah tindakan bantuan, bukan ukuran ketepatan sentuhan pada huruf.'],
  ['Latihan terkawal', 'Dakwat ialah gerakan sebenar yang sah. Gerakan tersasar dibatalkan dan perlu diulang selepas mengangkat jari. Pilihan digunakan untuk cubaan baharu; rekod lama tidak ditukar.'],
  ['Metrik', 'Ralat purata merangkumi segmen diterima. Gerakan tersasar turut direkodkan. Liputan Jejak Ceria diukur sebelum isian akhir paparan; warna penuh bukan bukti tulisan bebas. Bantuan selekoh direkodkan. Rekod lama kekal sebagai legacy-v1.'],
  ['Toleransi', 'Profil dikunci sepanjang cubaan. Mod kurang panduan tidak dilonggarkan. Nilai ini cadangan kejuruteraan, bukan standard KPM.'],
  ['Kandungan', '37 huruf merujuk bank kajian DBP. 12 huruf pilot ialah cadangan pembangunan. Tracing tidak menggantikan penilaian bacaan atau penyalinan perkataan PI 1.5.2–1.5.3.'],
  ['Ganjaran', 'Markah masa dan trofi ialah ganjaran permainan, bukan ukuran penguasaan KPM. Cabaran terhenti tidak memberikan trofi.'],
  ['Pratonton', 'Pratonton dewasa menguji fungsi permainan. Tiada kelulusan kandungan dibuat melalui butang ini.'],
  ['Storan', 'Kemajuan kekal dalam pelayar ini dan tidak disegerakkan. Salinan dihadkan kepada 12 hasil terkini; cabaran kepada 50 rekod terkini. Eksport merangkumi semua rekod disimpan.']
];
export function TeacherScreen({ letters, progress, store, matchStore, audio, diagnostic, preview, practiceMode, onPracticeMode, adjustment, onAdjustment, onPreview, onRefresh, onBack, onLetter, volume, onVolume, musicEnabled, musicVolume, onMusic, presentation, onPresentation }) {
  const matches = matchStore.read().matches;
  const [tab, setTab] = useState('settings'), [detail, setDetail] = useState(null), [resetConfirm, setResetConfirm] = useState(false);
  const [notice, setNotice] = useState(''), [recording, setRecording] = useState(null), objectUrl = useRef(null);
  const closeDetail = useCallback(() => setDetail(null), []), closeReset = useCallback(() => setResetConfirm(false), []);
  useEffect(() => () => { audio.stop(); if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, [audio]);
  const inspect = (title, fields) => setDetail({ title, fields });
  const ready = letters.filter(l => validateLetter(l).ready).length;
  function chooseRecording(event) {
    const file = event.target.files?.[0]; if (!file) return;
    if (file.size > 15 * 1024 * 1024 || !/\.(mp3|wav|ogg|m4a)$/i.test(file.name)) { setNotice('Pilih rakaman audio kurang daripada 15 MB.'); return; }
    audio.stop(); if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file); setRecording({ src: objectUrl.current, status: 'draft' }); setNotice('Rakaman dipilih. Tekan Mainkan untuk mendengar.');
  }
  async function audition() {
    const result = await audio.play(recording, { preview: true });
    setNotice(result.ok ? 'Rakaman pratonton dimainkan. Fail ini belum disimpan atau diluluskan.' : result.reason === 'blocked' ? 'Audio tidak dapat dimainkan. Tekan Mainkan untuk cuba semula.' : 'Pelayar ini tidak dapat memainkan rakaman. Cuba MP3 atau WAV pada pelayar lain.');
  }
  const tabs = [['settings','Tetapan'],['audio','Suara'],['content','Huruf'],['attempts','Cubaan'],['matches','Cabaran'],['copies','Salinan'],['diagnostics','Diagnostik'],['recording','Rakaman']];
  return <main className="teacher-page page-enter">
    <div className="teacher-heading"><button className="text-button back-button" onClick={onBack}><Icon name="back" size={18}/>Kembali</button><h1>Ruang guru</h1><button className="text-button" onClick={() => inspect('Panduan guru & penjaga', help)}>Panduan guru</button></div>
    <div className="teacher-tabs" role="tablist" aria-label="Bahagian ruang guru">{tabs.map(([id,label]) => <button key={id} role="tab" id={`tab-${id}`} aria-selected={tab === id} aria-controls="teacher-content" onClick={() => { audio.stop(); setTab(id); setNotice(''); }}>{label}</button>)}</div>
    <div id="teacher-content" role="tabpanel" aria-labelledby={`tab-${tab}`} className="teacher-content">
      {tab === 'settings' && <section className="teacher-panel"><h2>Pilihan latihan</h2><p>{ready} pelajaran sedia · {progress.attempts.length} cubaan disimpan</p><div className="teacher-settings-grid">
        <label htmlFor="practice-mode"><span>Jenis latihan</span><select id="practice-mode" value={practiceMode} onChange={e => onPracticeMode(e.target.value)}><option value="play">Jejak Ceria · dengan bantuan</option><option value="guided">Berpandu · jejak terkawal</option><option value="precision">Kurang panduan · jejak terkawal</option></select></label>
        <label htmlFor="adjustment"><span>Toleransi latihan berpandu</span><select id="adjustment" value={adjustment} onChange={e => onAdjustment(e.target.value)}><option value="standard">Standard pembangunan</option><option value="support">Bantuan tambahan (+8 unit)</option></select></label>
        <label htmlFor="presentation"><span>Paparan permainan</span><select id="presentation" value={presentation} onChange={e => onPresentation(e.target.value)}><option value="light">Paparan ringan</option><option value="full">Paparan penuh</option></select></label>
        <label htmlFor="volume"><span>Kelantangan audio</span><input id="volume" type="range" min="0" max="1" step="0.1" value={volume} onChange={e => onVolume(Number(e.target.value))}/></label>
        <div className="music-setting"><label className="music-switch" htmlFor="music-enabled"><input id="music-enabled" type="checkbox" checked={musicEnabled} onChange={e => onMusic({ enabled: e.target.checked })}/><span>Muzik latar</span></label><input id="music-volume" aria-label="Kelantangan muzik latar" type="range" min="0" max="0.5" step="0.05" value={musicVolume} disabled={!musicEnabled} onChange={e => onMusic({ volume: Number(e.target.value) })}/></div></div>
        <div className="teacher-settings-actions"><button className="button button-primary" aria-label="Buka pratonton dewasa" onClick={onPreview}><Icon name="pen"/>Pratonton dewasa</button><button className="button button-outline" aria-label="Tentang latihan & rekod" onClick={() => inspect('Panduan guru & penjaga', help)}>Panduan</button></div>

      </section>}
      {tab === 'audio' && <AudioReviewPanel letters={letters} audio={audio}/>}
      {tab === 'recording' && <section className="teacher-panel"><h2>Rakaman pratonton</h2><p>Pilih fail untuk perbandingan. Fail ini tidak disimpan atau diluluskan.</p><div className="teacher-recording"><label className="file-button"><Icon name="sound"/>Pilih rakaman pratonton<input type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,.mp3,.wav,.ogg,.m4a" onChange={chooseRecording}/></label>{recording && <button className="button button-soft" onClick={audition}>Mainkan rakaman dipilih</button>}{notice && <p role="status" className="audio-notice">{notice}</p>}</div></section>}
      {tab === 'content' && <PagedRecords key="content" items={letters} label="Halaman kandungan" render={letter => <article key={letter.id} className="record-card"><div><span className="jawi table-glyph" dir="rtl" lang="ms-Arab"><LetterModelGlyph letter={letter}/></span><h3>{letter.labelMs}</h3></div><p>{letter.geometry.status === 'approved' ? 'Diluluskan' : 'Draf · perlu semakan'} · {letter.contentVersion}</p><div><button className="text-button" disabled={!letter.geometry.strokes.length} onClick={() => onLetter(letter)}>Buka<Icon name="arrow" size={16}/></button><button className="button button-outline" onClick={() => inspect('Semakan ' + letter.labelMs, recordFields({ contentVersion: letter.contentVersion, geometryStatus: letter.geometry.status, geometryReview: letter.geometry.review, audioStatus: letter.audio.name.status, audioVersion: letter.audio.name.version, audioTranscript: letter.audio.name.transcriptMs, audioOrigin: letter.audio.name.origin, audioReview: letter.audio.name.review }))}>Butiran</button></div></article>}/>}
      {tab === 'attempts' && <PagedRecords key="attempts" items={progress.attempts.slice().reverse()} empty="Cubaan yang selesai akan dipaparkan di sini." render={attempt => <article key={attempt.id} data-record-id={attempt.id} className="record-card"><h3>{attempt.profile} · {attempt.letterId}</h3><p>{attempt.mode === 'play' ? 'Jejak Ceria · dengan bantuan' : attempt.mode} · {Math.round(attempt.metrics.coverage * 100)}% liputan</p><div><small>{new Date(attempt.timestamp).toLocaleDateString('ms-MY')}</small><button className="button button-outline" onClick={() => inspect('Butiran cubaan', recordFields(attempt))}>Butiran cubaan</button></div></article>}/>}
      {tab === 'matches' && <PagedRecords key="matches" items={matches.slice().reverse()} empty="Cabaran yang selesai atau dihentikan akan dipaparkan di sini." render={match => { const awards = matchAwards(match.mode, match.rounds, match.profiles.length); return <article key={match.id} className="record-card"><h3>{match.profiles.join(' / ')} · {match.mode === 'duo' ? 'Duo 1v1' : 'Solo'}</h3><p>{match.status === 'completed' ? 'Selesai' : 'Dihentikan'} · {awards.totals.join(' / ')} markah</p><div><small>{match.status === 'completed' ? awards.trophy || 'Tiada trofi' : 'Tiada trofi'}</small><button className="button button-outline" onClick={() => inspect('Butiran cabaran', [...recordFields({ ...match, rounds: undefined, partialRound: undefined }), ...match.rounds.flatMap((round,i) => recordFields(round, 'Pusingan ' + (i+1))), ...(match.partialRound ? recordFields(match.partialRound, 'Pusingan terhenti') : [])])}>Butiran cabaran</button></div></article>; }}/ >}
      {tab === 'copies' && <PagedRecords key="copies" tall items={progress.copies.slice().reverse()} empty="Selepas jejak huruf, pilih “cuba salin sendiri”." render={copy => <article key={copy.id} className="record-card"><CopyThumbnail copy={copy}/><div><strong>{copy.profile} · {copy.letterId}</strong><button className="text-button" onClick={() => inspect('Butiran salinan', recordFields({ ...copy, ink: undefined }))}>Butiran</button></div><small>{new Date(copy.timestamp).toLocaleString('ms-MY')}</small></article>}/>}
      {tab === 'diagnostics' && <section className="teacher-panel"><h2>Diagnostik sesi terakhir</h2>{diagnostic ? <><p>{diagnostic.timing?.samples || 0} sampel. Purata: {((diagnostic.timing?.totalMs || 0) / Math.max(1, diagnostic.timing?.samples || 0)).toFixed(2)} ms; maksimum: {(diagnostic.timing?.maxMs || 0).toFixed(2)} ms.</p><p>Ini masa pengendalian JavaScript, bukan keseluruhan latensi skrin. Eksport mengandungi koordinat tulisan; jejak kekal dalam memori sehingga dieksport.</p><button className="button button-outline" onClick={() => download('taman-jawi-diagnostik.json', JSON.stringify(diagnostic, null, 2))}><Icon name="download"/>Eksport jejak sesi ini</button></> : <p>Mulakan latihan untuk melihat diagnostik sesi.</p>}</section>}
    </div>
    <footer className="teacher-footer"><span role="status">{store.isAvailable() && matchStore.isAvailable() ? 'Disimpan pada peranti ini.' : 'Storan tidak tersedia. Eksport sebelum menutup.'}</span><div><button className="button button-outline" onClick={() => download('taman-jawi-kemajuan.json', JSON.stringify({ exportVersion: 2, progress: store.read(), matches: matchStore.export() }, null, 2))}><Icon name="download" size={18}/>Eksport kemajuan</button><button className="text-button" onClick={() => setResetConfirm(true)}>Padam rekod</button></div></footer>
    {detail && <FitDialog title={detail.title} onClose={closeDetail}><DetailPages fields={detail.fields}/></FitDialog>}
    {resetConfirm && <FitDialog title="Sahkan pemadaman" onClose={closeReset}><div className="letter-help"><p>Padam semua profil, cubaan, salinan dan rekod cabaran Solo / Duo pada pelayar ini?</p><button className="button button-outline" onClick={() => { store.reset(); matchStore.reset(); onRefresh(); setResetConfirm(false); }}>Ya, padam rekod</button><button className="text-button" onClick={closeReset}>Batal</button></div></FitDialog>}
  </main>;
}
