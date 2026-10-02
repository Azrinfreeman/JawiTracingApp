# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: numbered-guides.spec.js >> all 12 initial guides are legible and contained on phone and tablet
- Location: tests\browser\numbered-guides.spec.js:57:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Buka pratonton dewasa' })
    - locator resolved to <button class="button button-primary">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not stable
    - retrying click action
      - waiting 100ms

```

# Page snapshot

```yaml
- generic [ref=f18e3]:
  - link "Langkau ke kandungan" [ref=f18e4] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=f18e5]:
    - button "Taman Jawi, halaman utama" [ref=f18e6] [cursor=pointer]:
      - generic [ref=f18e12]:
        - text: Taman Jawi
        - generic [ref=f18e13]: TUMBUH BERSAMA HURUF
    - navigation "Navigasi utama" [ref=f18e14]:
      - button "Ruang guru" [ref=f18e15] [cursor=pointer]
      - button "Senyapkan audio" [ref=f18e20] [cursor=pointer]
      - generic "Profil Bunga" [ref=f18e24]: ✿
  - main [ref=f18e26]:
    - button "Kembali" [ref=f18e27] [cursor=pointer]
    - generic [ref=f18e31]:
      - generic [ref=f18e32]: UNTUK GURU & PENJAGA
      - heading "Ruang guru" [active] [level=1] [ref=f18e33]
      - paragraph [ref=f18e34]: Pantau cubaan, semak kandungan, dan sediakan suara pembelajaran.
    - generic [ref=f18e35]:
      - generic [ref=f18e36]:
        - strong [ref=f18e37]: "37"
        - generic [ref=f18e38]: huruf dalam katalog
      - generic [ref=f18e39]:
        - strong [ref=f18e40]: "12"
        - generic [ref=f18e41]: model huruf untuk pratonton
      - generic [ref=f18e42]:
        - strong [ref=f18e43]: "12"
        - generic [ref=f18e44]: pelajaran sedia untuk murid
      - generic [ref=f18e45]:
        - strong [ref=f18e46]: "0"
        - generic [ref=f18e47]: cubaan jejak disimpan
    - generic [ref=f18e48]:
      - heading "Pilihan latihan" [level=2] [ref=f18e49]
      - generic [ref=f18e50]: Jenis latihan
      - combobox "Jenis latihan" [ref=f18e51]:
        - option "Jejak Ceria · dengan bantuan" [selected]
        - option "Berpandu · jejak terkawal"
        - option "Kurang panduan · jejak terkawal"
      - paragraph [ref=f18e52]: Jejak Ceria mengisi laluan dengan warna sebagai bantuan. Jika tersasar, kemajuan berhenti sekejap dan boleh disambung tanpa memadam kerja yang sudah diterima. Pad titik ialah tindakan bantuan, bukan ukuran ketepatan sentuhan pada huruf.
      - paragraph [ref=f18e53]: Dalam latihan terkawal, dakwat ialah gerakan sebenar yang sah. Gerakan tersasar dibatalkan dan perlu diulang selepas mengangkat jari. Pilihan ini digunakan untuk cubaan baharu; rekod lama tidak ditukar.
      - paragraph [ref=f18e54]: Ralat purata merangkumi segmen yang diterima sepanjang cubaan. Gerakan tersasar turut direkodkan. Dalam Jejak Ceria, liputan diukur sebelum isian akhir paparan; warna penuh bukan bukti tulisan bebas. Bantuan kecil pada selekoh rapat turut direkodkan dalam diagnostik. Rekod lama kekal sebagai legacy-v1.
    - generic [ref=f18e55]:
      - generic [ref=f18e56]:
        - heading "Mod penggunaan" [level=2] [ref=f18e57]
        - paragraph [ref=f18e58]: 12 model huruf telah diluluskan oleh pemilik projek. 37 rakaman nama tersedia untuk semakan; semakan guru Jawi bernama belum direkodkan.
        - button "Buka pratonton dewasa" [ref=f18e59] [cursor=pointer]
        - paragraph [ref=f18e63]: Pratonton belum aktif. Tiada kelulusan kandungan dibuat melalui butang ini.
        - generic [ref=f18e64]: Toleransi latihan berpandu
        - combobox "Toleransi latihan berpandu" [ref=f18e65]:
          - option "Standard pembangunan" [selected]
          - option "Bantuan tambahan (+8 unit)"
        - paragraph [ref=f18e66]: Profil dikunci sepanjang cubaan. Mod kurang panduan tidak dilonggarkan. Nilai ini cadangan kejuruteraan, bukan standard KPM.
      - generic [ref=f18e67]:
        - heading "Rakaman & kemajuan" [level=2] [ref=f18e68]
        - paragraph [ref=f18e69]: 37 rakaman nama huruf tersedia untuk didengar. 37 rakaman diluluskan; contoh bunyi belum ditambah. Pilih fail sendiri untuk membandingkan rakaman.
        - generic [ref=f18e70] [cursor=pointer]:
          - text: Pilih rakaman pratonton
          - button "Pilih rakaman pratonton" [ref=f18e74]
        - generic [ref=f18e75]:
          - button "Eksport kemajuan" [ref=f18e76] [cursor=pointer]
          - button "Padam rekod" [ref=f18e79] [cursor=pointer]
        - paragraph [ref=f18e80]: Kemajuan kekal dalam pelayar ini dan tidak disegerakkan ke peranti lain. Salinan dihadkan kepada 12 hasil terkini.
    - region [ref=f18e81]:
      - heading "Semakan suara Jawi" [level=2] [ref=f18e82]
      - paragraph [ref=f18e83]: 37 rakaman nama huruf tersedia. 37 rakaman diluluskan.
      - generic [ref=f18e84]: Huruf untuk semakan suara
      - combobox "Huruf untuk semakan suara" [ref=f18e85]:
        - option "Alif · ا" [selected]
        - option "Ba · ب"
        - option "Ta · ت"
        - option "Ta marbutah · ة"
        - option "Sa · ث"
        - option "Jim · ج"
        - option "Ca · چ"
        - option "Ha (ح) · ح"
        - option "Kha · خ"
        - option "Dal · د"
        - option "Zal · ذ"
        - option "Ra · ر"
        - option "Zai · ز"
        - option "Sin · س"
        - option "Syin · ش"
        - option "Sad · ص"
        - option "Dad · ض"
        - option "Ta (ط) · ط"
        - option "Za · ظ"
        - option "Ain · ع"
        - option "Ghain · غ"
        - option "Nga · ڠ"
        - option "Fa · ف"
        - option "Pa · ڤ"
        - option "Qaf · ق"
        - option "Kaf · ک"
        - option "Ga · ڬ"
        - option "Lam · ل"
        - option "Mim · م"
        - option "Nun · ن"
        - option "Wau · و"
        - option "Va · ۏ"
        - option "Ha (ه) · ه"
        - option "Hamzah · ء"
        - option "Ya · ي"
        - option "Ye · ى"
        - option "Nya · ڽ"
      - paragraph [ref=f18e86]:
        - generic [ref=f18e87]: ا
        - generic [ref=f18e88]:
          - text: "Nama disebut:"
          - strong [ref=f18e89]: Alif
          - generic [ref=f18e90]: Suara diluluskan
          - generic [ref=f18e91]: Rakaman pilihan anda
      - generic [ref=f18e92]:
        - button "Dengar rakaman Alif" [ref=f18e93] [cursor=pointer]
        - button "Rakaman seterusnya" [ref=f18e97] [cursor=pointer]
      - paragraph [ref=f18e100]: Dengar nama huruf, kemudian semak kejelasan sebutan, kelajuan dan kesesuaian untuk murid. Butang Dengar dan Rakaman seterusnya tidak memberi kelulusan.
    - generic [ref=f18e101]:
      - heading "Kandungan & semakan" [level=2] [ref=f18e102]
      - paragraph [ref=f18e103]: 37 huruf merujuk bank kajian DBP. Pilihan 12 huruf pilot ialah cadangan pembangunan. Tracing tidak menggantikan penilaian bacaan atau penyalinan perkataan PI 1.5.2–1.5.3.
      - table [ref=f18e105]:
        - rowgroup [ref=f18e106]:
          - row [ref=f18e107]:
            - columnheader "Huruf" [ref=f18e108]
            - columnheader "Model" [ref=f18e109]
            - columnheader "Rakaman nama" [ref=f18e110]
            - columnheader "Versi" [ref=f18e111]
            - columnheader "Pratonton" [ref=f18e112]
        - rowgroup [ref=f18e113]:
          - row [ref=f18e114]:
            - cell "ا Alif" [ref=f18e115]:
              - generic [ref=f18e116]: ا
              - text: Alif
            - cell "Diluluskan · pemilik projek 2026-10-02" [ref=f18e117]:
              - text: Diluluskan · pemilik projek
              - generic [ref=f18e118]: 2026-10-02
            - cell "Diluluskan" [ref=f18e119]
            - cell "1" [ref=f18e120]
            - cell [ref=f18e121]:
              - button "Buka" [ref=f18e122] [cursor=pointer]
          - row [ref=f18e125]:
            - cell "ب Ba" [ref=f18e126]:
              - generic [ref=f18e127]: ب
              - text: Ba
            - cell "Diluluskan · pemilik projek 2026-10-02" [ref=f18e128]:
              - text: Diluluskan · pemilik projek
              - generic [ref=f18e129]: 2026-10-02
            - cell "Diluluskan" [ref=f18e130]
            - cell "1" [ref=f18e131]
            - cell [ref=f18e132]:
              - button "Buka" [ref=f18e133] [cursor=pointer]
          - row [ref=f18e136]:
            - cell "ت Ta" [ref=f18e137]:
              - generic [ref=f18e138]: ت
              - text: Ta
            - cell "Diluluskan · pemilik projek 2026-10-02" [ref=f18e139]:
              - text: Diluluskan · pemilik projek
              - generic [ref=f18e140]: 2026-10-02
            - cell "Diluluskan" [ref=f18e141]
            - cell "1" [ref=f18e142]
            - cell [ref=f18e143]:
              - button "Buka" [ref=f18e144] [cursor=pointer]
          - row [ref=f18e147]:
            - cell "ة Ta marbutah" [ref=f18e148]:
              - generic [ref=f18e149]: ة
              - text: Ta marbutah
            - cell "Model belum tersedia" [ref=f18e150]
            - cell "Diluluskan" [ref=f18e151]
            - cell "1" [ref=f18e152]
            - cell [ref=f18e153]:
              - button "Buka" [disabled] [ref=f18e154]
          - row [ref=f18e157]:
            - cell "ث Sa" [ref=f18e158]:
              - generic [ref=f18e159]: ث
              - text: Sa
            - cell "Model belum tersedia" [ref=f18e160]
            - cell "Diluluskan" [ref=f18e161]
            - cell "1" [ref=f18e162]
            - cell [ref=f18e163]:
              - button "Buka" [disabled] [ref=f18e164]
          - row [ref=f18e167]:
            - cell "ج Jim" [ref=f18e168]:
              - generic [ref=f18e169]: ج
              - text: Jim
            - cell "Model belum tersedia" [ref=f18e170]
            - cell "Diluluskan" [ref=f18e171]
            - cell "1" [ref=f18e172]
            - cell [ref=f18e173]:
              - button "Buka" [disabled] [ref=f18e174]
          - row [ref=f18e177]:
            - cell "چ Ca" [ref=f18e178]:
              - generic [ref=f18e179]: چ
              - text: Ca
            - cell "Model belum tersedia" [ref=f18e180]
            - cell "Diluluskan" [ref=f18e181]
            - cell "1" [ref=f18e182]
            - cell [ref=f18e183]:
              - button "Buka" [disabled] [ref=f18e184]
          - row [ref=f18e187]:
            - cell "ح Ha (ح)" [ref=f18e188]:
              - generic [ref=f18e189]: ح
              - text: Ha (ح)
            - cell "Model belum tersedia" [ref=f18e190]
            - cell "Diluluskan" [ref=f18e191]
            - cell "1" [ref=f18e192]
            - cell [ref=f18e193]:
              - button "Buka" [disabled] [ref=f18e194]
          - row [ref=f18e197]:
            - cell "خ Kha" [ref=f18e198]:
              - generic [ref=f18e199]: خ
              - text: Kha
            - cell "Model belum tersedia" [ref=f18e200]
            - cell "Diluluskan" [ref=f18e201]
            - cell "1" [ref=f18e202]
            - cell [ref=f18e203]:
              - button "Buka" [disabled] [ref=f18e204]
          - row [ref=f18e207]:
            - cell "د Dal" [ref=f18e208]:
              - generic [ref=f18e209]: د
              - text: Dal
            - cell "Diluluskan · pemilik projek 2026-10-02" [ref=f18e210]:
              - text: Diluluskan · pemilik projek
              - generic [ref=f18e211]: 2026-10-02
            - cell "Diluluskan" [ref=f18e212]
            - cell "1" [ref=f18e213]
            - cell [ref=f18e214]:
              - button "Buka" [ref=f18e215] [cursor=pointer]
          - row [ref=f18e218]:
            - cell "ذ Zal" [ref=f18e219]:
              - generic [ref=f18e220]: ذ
              - text: Zal
            - cell "Model belum tersedia" [ref=f18e221]
            - cell "Diluluskan" [ref=f18e222]
            - cell "1" [ref=f18e223]
            - cell [ref=f18e224]:
              - button "Buka" [disabled] [ref=f18e225]
          - row [ref=f18e228]:
            - cell "ر Ra" [ref=f18e229]:
              - generic [ref=f18e230]: ر
              - text: Ra
            - cell "Diluluskan · pemilik projek 2026-10-02" [ref=f18e231]:
              - text: Diluluskan · pemilik projek
              - generic [ref=f18e232]: 2026-10-02
            - cell "Diluluskan" [ref=f18e233]
            - cell "1" [ref=f18e234]
            - cell [ref=f18e235]:
              - button "Buka" [ref=f18e236] [cursor=pointer]
          - row [ref=f18e239]:
            - cell "ز Zai" [ref=f18e240]:
              - generic [ref=f18e241]: ز
              - text: Zai
            - cell "Model belum tersedia" [ref=f18e242]
            - cell "Diluluskan" [ref=f18e243]
            - cell "1" [ref=f18e244]
            - cell [ref=f18e245]:
              - button "Buka" [disabled] [ref=f18e246]
          - row [ref=f18e249]:
            - cell "س Sin" [ref=f18e250]:
              - generic [ref=f18e251]: س
              - text: Sin
            - cell "Diluluskan · pemilik projek 2026-10-02" [ref=f18e252]:
              - text: Diluluskan · pemilik projek
              - generic [ref=f18e253]: 2026-10-02
            - cell "Diluluskan" [ref=f18e254]
            - cell "1" [ref=f18e255]
            - cell [ref=f18e256]:
              - button "Buka" [ref=f18e257] [cursor=pointer]
          - row [ref=f18e260]:
            - cell "ش Syin" [ref=f18e261]:
              - generic [ref=f18e262]: ش
              - text: Syin
            - cell "Model belum tersedia" [ref=f18e263]
            - cell "Diluluskan" [ref=f18e264]
            - cell "1" [ref=f18e265]
            - cell [ref=f18e266]:
              - button "Buka" [disabled] [ref=f18e267]
          - row [ref=f18e270]:
            - cell "ص Sad" [ref=f18e271]:
              - generic [ref=f18e272]: ص
              - text: Sad
            - cell "Model belum tersedia" [ref=f18e273]
            - cell "Diluluskan" [ref=f18e274]
            - cell "1" [ref=f18e275]
            - cell [ref=f18e276]:
              - button "Buka" [disabled] [ref=f18e277]
          - row [ref=f18e280]:
            - cell "ض Dad" [ref=f18e281]:
              - generic [ref=f18e282]: ض
              - text: Dad
            - cell "Model belum tersedia" [ref=f18e283]
            - cell "Diluluskan" [ref=f18e284]
            - cell "1" [ref=f18e285]
            - cell [ref=f18e286]:
              - button "Buka" [disabled] [ref=f18e287]
          - row [ref=f18e290]:
            - cell "ط Ta (ط)" [ref=f18e291]:
              - generic [ref=f18e292]: ط
              - text: Ta (ط)
            - cell "Model belum tersedia" [ref=f18e293]
            - cell "Diluluskan" [ref=f18e294]
            - cell "1" [ref=f18e295]
            - cell [ref=f18e296]:
              - button "Buka" [disabled] [ref=f18e297]
          - row [ref=f18e300]:
            - cell "ظ Za" [ref=f18e301]:
              - generic [ref=f18e302]: ظ
              - text: Za
            - cell "Model belum tersedia" [ref=f18e303]
            - cell "Diluluskan" [ref=f18e304]
            - cell "1" [ref=f18e305]
            - cell [ref=f18e306]:
              - button "Buka" [disabled] [ref=f18e307]
          - row [ref=f18e310]:
            - cell "ع Ain" [ref=f18e311]:
              - generic [ref=f18e312]: ع
              - text: Ain
            - cell "Model belum tersedia" [ref=f18e313]
            - cell "Diluluskan" [ref=f18e314]
            - cell "1" [ref=f18e315]
            - cell [ref=f18e316]:
              - button "Buka" [disabled] [ref=f18e317]
          - row [ref=f18e320]:
            - cell "غ Ghain" [ref=f18e321]:
              - generic [ref=f18e322]: غ
              - text: Ghain
            - cell "Model belum tersedia" [ref=f18e323]
            - cell "Diluluskan" [ref=f18e324]
            - cell "1" [ref=f18e325]
            - cell [ref=f18e326]:
              - button "Buka" [disabled] [ref=f18e327]
          - row [ref=f18e330]:
            - cell "ڠ Nga" [ref=f18e331]:
              - generic [ref=f18e332]: ڠ
              - text: Nga
            - cell "Model belum tersedia" [ref=f18e333]
            - cell "Diluluskan" [ref=f18e334]
            - cell "1" [ref=f18e335]
            - cell [ref=f18e336]:
              - button "Buka" [disabled] [ref=f18e337]
          - row [ref=f18e340]:
            - cell "ف Fa" [ref=f18e341]:
              - generic [ref=f18e342]: ف
              - text: Fa
            - cell "Model belum tersedia" [ref=f18e343]
            - cell "Diluluskan" [ref=f18e344]
            - cell "1" [ref=f18e345]
            - cell [ref=f18e346]:
              - button "Buka" [disabled] [ref=f18e347]
          - row [ref=f18e350]:
            - cell "ڤ Pa" [ref=f18e351]:
              - generic [ref=f18e352]: ڤ
              - text: Pa
            - cell "Model belum tersedia" [ref=f18e353]
            - cell "Diluluskan" [ref=f18e354]
            - cell "1" [ref=f18e355]
            - cell [ref=f18e356]:
              - button "Buka" [disabled] [ref=f18e357]
          - row [ref=f18e360]:
            - cell "ق Qaf" [ref=f18e361]:
              - generic [ref=f18e362]: ق
              - text: Qaf
            - cell "Model belum tersedia" [ref=f18e363]
            - cell "Diluluskan" [ref=f18e364]
            - cell "1" [ref=f18e365]
            - cell [ref=f18e366]:
              - button "Buka" [disabled] [ref=f18e367]
          - row [ref=f18e370]:
            - cell "ک Kaf" [ref=f18e371]:
              - generic [ref=f18e372]: ک
              - text: Kaf
            - cell "Diluluskan · pemilik projek 2026-10-02" [ref=f18e373]:
              - text: Diluluskan · pemilik projek
              - generic [ref=f18e374]: 2026-10-02
            - cell "Diluluskan" [ref=f18e375]
            - cell "1" [ref=f18e376]
            - cell [ref=f18e377]:
              - button "Buka" [ref=f18e378] [cursor=pointer]
          - row [ref=f18e381]:
            - cell "ڬ Ga" [ref=f18e382]:
              - generic [ref=f18e383]: ڬ
              - text: Ga
            - cell "Model belum tersedia" [ref=f18e384]
            - cell "Diluluskan" [ref=f18e385]
            - cell "1" [ref=f18e386]
            - cell [ref=f18e387]:
              - button "Buka" [disabled] [ref=f18e388]
          - row [ref=f18e391]:
            - cell "ل Lam" [ref=f18e392]:
              - generic [ref=f18e393]: ل
              - text: Lam
            - cell "Diluluskan · pemilik projek 2026-10-02" [ref=f18e394]:
              - text: Diluluskan · pemilik projek
              - generic [ref=f18e395]: 2026-10-02
            - cell "Diluluskan" [ref=f18e396]
            - cell "1" [ref=f18e397]
            - cell [ref=f18e398]:
              - button "Buka" [ref=f18e399] [cursor=pointer]
          - row [ref=f18e402]:
            - cell "م Mim" [ref=f18e403]:
              - generic [ref=f18e404]: م
              - text: Mim
            - cell "Diluluskan · pemilik projek 2026-10-02" [ref=f18e405]:
              - text: Diluluskan · pemilik projek
              - generic [ref=f18e406]: 2026-10-02
            - cell "Diluluskan" [ref=f18e407]
            - cell "1" [ref=f18e408]
            - cell [ref=f18e409]:
              - button "Buka" [ref=f18e410] [cursor=pointer]
          - row [ref=f18e413]:
            - cell "ن Nun" [ref=f18e414]:
              - generic [ref=f18e415]: ن
              - text: Nun
            - cell "Diluluskan · pemilik projek 2026-10-02" [ref=f18e416]:
              - text: Diluluskan · pemilik projek
              - generic [ref=f18e417]: 2026-10-02
            - cell "Diluluskan" [ref=f18e418]
            - cell "1" [ref=f18e419]
            - cell [ref=f18e420]:
              - button "Buka" [ref=f18e421] [cursor=pointer]
          - row [ref=f18e424]:
            - cell "و Wau" [ref=f18e425]:
              - generic [ref=f18e426]: و
              - text: Wau
            - cell "Diluluskan · pemilik projek 2026-10-02" [ref=f18e427]:
              - text: Diluluskan · pemilik projek
              - generic [ref=f18e428]: 2026-10-02
            - cell "Diluluskan" [ref=f18e429]
            - cell "1" [ref=f18e430]
            - cell [ref=f18e431]:
              - button "Buka" [ref=f18e432] [cursor=pointer]
          - row [ref=f18e435]:
            - cell "ۏ Va" [ref=f18e436]:
              - generic [ref=f18e437]: ۏ
              - text: Va
            - cell "Model belum tersedia" [ref=f18e438]
            - cell "Diluluskan" [ref=f18e439]
            - cell "1" [ref=f18e440]
            - cell [ref=f18e441]:
              - button "Buka" [disabled] [ref=f18e442]
          - row [ref=f18e445]:
            - cell "ه Ha (ه)" [ref=f18e446]:
              - generic [ref=f18e447]: ه
              - text: Ha (ه)
            - cell "Model belum tersedia" [ref=f18e448]
            - cell "Diluluskan" [ref=f18e449]
            - cell "1" [ref=f18e450]
            - cell [ref=f18e451]:
              - button "Buka" [disabled] [ref=f18e452]
          - row [ref=f18e455]:
            - cell "ء Hamzah" [ref=f18e456]:
              - generic [ref=f18e457]: ء
              - text: Hamzah
            - cell "Model belum tersedia" [ref=f18e458]
            - cell "Diluluskan" [ref=f18e459]
            - cell "1" [ref=f18e460]
            - cell [ref=f18e461]:
              - button "Buka" [disabled] [ref=f18e462]
          - row [ref=f18e465]:
            - cell "ي Ya" [ref=f18e466]:
              - generic [ref=f18e467]: ي
              - text: Ya
            - cell "Diluluskan · pemilik projek 2026-10-02" [ref=f18e468]:
              - text: Diluluskan · pemilik projek
              - generic [ref=f18e469]: 2026-10-02
            - cell "Diluluskan" [ref=f18e470]
            - cell "1" [ref=f18e471]
            - cell [ref=f18e472]:
              - button "Buka" [ref=f18e473] [cursor=pointer]
          - row [ref=f18e476]:
            - cell "ى Ye" [ref=f18e477]:
              - generic [ref=f18e478]: ى
              - text: Ye
            - cell "Model belum tersedia" [ref=f18e479]
            - cell "Diluluskan" [ref=f18e480]
            - cell "1" [ref=f18e481]
            - cell [ref=f18e482]:
              - button "Buka" [disabled] [ref=f18e483]
          - row [ref=f18e486]:
            - cell "ڽ Nya" [ref=f18e487]:
              - generic [ref=f18e488]: ڽ
              - text: Nya
            - cell "Model belum tersedia" [ref=f18e489]
            - cell "Diluluskan" [ref=f18e490]
            - cell "1" [ref=f18e491]
            - cell [ref=f18e492]:
              - button "Buka" [disabled] [ref=f18e493]
    - generic [ref=f18e496]:
      - heading "Cubaan terkini" [level=2] [ref=f18e497]
      - paragraph [ref=f18e498]: Peratus liputan ialah ukuran geometri dalam aktiviti ini, bukan TP KPM atau penguasaan tulisan bebas.
      - paragraph [ref=f18e499]: Cubaan yang selesai akan dipaparkan di sini.
    - generic [ref=f18e500]:
      - heading "Salinan untuk pemerhatian" [level=2] [ref=f18e501]
      - paragraph [ref=f18e502]: Hasil ini ialah tulisan sebenar pengguna. Tiada skor pengecaman tulisan bebas diberikan.
      - paragraph [ref=f18e504]: Selepas jejak huruf, pilih “cuba salin sendiri”.
  - contentinfo [ref=f18e505]:
    - generic [ref=f18e506]: Dibuat untuk langkah kecil yang bermakna.
    - generic [ref=f18e510]: Kenal. Dengar. Jejak.
    - generic [ref=f18e511]:
      - generic [ref=f18e512]: Dibangunkan oleh
      - img "Hanana Academy" [ref=f18e514]
  - generic [ref=f18e515]:
    - generic [ref=f18e516]: Kelantangan audio
    - slider "Kelantangan audio" [ref=f18e517]: "0.8"
```

# Test source

```ts
  1  | import { expect } from '@playwright/test';
  2  | import { dismissSplash, selectPractice } from './navigation.js';
  3  | 
  4  | export async function openLesson(page, label = 'Alif', mode = 'guided') {
  5  |   await page.goto('/'); await dismissSplash(page);
  6  |   await page.getByRole('button', { name: 'Ruang guru', exact: true }).click();
> 7  |   await page.getByRole('button', { name: 'Buka pratonton dewasa' }).click();
     |                                                                     ^ Error: locator.click: Test timeout of 120000ms exceeded.
  8  |   if (mode !== 'play') await selectPractice(page, mode);
  9  |   await page.getByRole('button', { name: new RegExp(`^${label}(?:, pernah dijejak)?$`) }).click();
  10 |   await expect(page.locator('.start-dot')).toBeVisible();
  11 |   await page.locator('.trace-board').scrollIntoViewIfNeeded();
  12 | }
  13 | 
  14 | export async function boardModels(page) {
  15 |   await page.locator('.trace-board').scrollIntoViewIfNeeded();
  16 |   return page.locator('.trace-board').evaluate(svg => {
  17 |     const matrix = svg.getScreenCTM();
  18 |     const screen = p => { const q = new DOMPoint(p.x, p.y).matrixTransform(matrix); return { x: q.x, y: q.y }; };
  19 |     return { scale: Math.hypot(matrix.a, matrix.b),
  20 |       strokes: [...svg.querySelectorAll('.reference-stroke')].map(path => {
  21 |         const count = Math.ceil(path.getTotalLength() / 6);
  22 |         return Array.from({ length: count + 1 }, (_, i) => screen(path.getPointAtLength(path.getTotalLength() * i / count)));
  23 |       }),
  24 |       dots: [...svg.querySelectorAll('.reference-dot')].map(dot => screen({ x: +dot.getAttribute('cx'), y: +dot.getAttribute('cy') })),
  25 |     };
  26 |   });
  27 | }
  28 | 
  29 | export async function movePoints(page, points) { for (const point of points) await page.mouse.move(point.x, point.y); }
  30 | export async function draw(page, points) {
  31 |   await page.mouse.move(points[0].x, points[0].y); await page.mouse.down();
  32 |   await movePoints(page, points.slice(1)); await page.mouse.up();
  33 | }
  34 | 
```