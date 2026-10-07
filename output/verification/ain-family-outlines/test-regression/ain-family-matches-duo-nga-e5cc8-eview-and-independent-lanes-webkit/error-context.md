# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ain-family-matches.spec.js >> duo nga: unscored two-part outline preview and independent lanes
- Location: tests\browser\ain-family-matches.spec.js:12:72

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 14
+ Received  +  1

- Array [
-   Object {
-     "contentVersion": 4,
-     "geometryStatus": "pendingReview",
-     "letterId": "nga",
-     "unscored": true,
-   },
-   Object {
-     "contentVersion": 4,
-     "geometryStatus": "pendingReview",
-     "letterId": "nga",
-     "unscored": true,
-   },
- ]
+ Array []
```

```
Error: browserContext._wrapApiCall: file data stream has unexpected number of bytes
```

# Page snapshot

```yaml
- main [ref=e3]:
  - heading "Duo 1v1" [level=1] [ref=e4]
  - button "Menu permainan" [disabled] [ref=e6]:
    - generic [aria-hidden] [ref=e7]: ☰
    - generic [ref=e8]: Menu
  - generic [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e12]:
        - text: Pusingan 1/1 ·
        - strong [ref=e13]: Nga
        - generic [ref=e14]: · Pratonton · tanpa markah
      - button "Dengar nama Nga" [disabled] [ref=e15]: Dengar
    - generic "Baki masa" [ref=e19]:
      - text: "22"
      - generic [ref=e20]: saat
  - generic [ref=e21]:
    - region "Pemain 1, Bunga" [ref=e22]:
      - generic [ref=e23]:
        - generic [ref=e24]:
          - img "Ruang jejak huruf Nga. Gunakan jari, pen atau tetikus." [ref=e27]
          - status [ref=e44]: Kamu sudah ikut semua bahagian!
        - generic:
          - heading "Bunga Pemain 1" [level=2]:
            - text: Bunga
            - generic: Pemain 1
          - strong:
            - text: —
            - generic: markah
        - status [ref=e47]: Siap! Tunggu teman.
    - region "Pemain 2, Daun" [ref=e51]:
      - generic [ref=e52]:
        - generic [ref=e53]:
          - img "Ruang jejak huruf Nga. Gunakan jari, pen atau tetikus." [ref=e56]
          - status [ref=e73]: Kamu sudah ikut semua bahagian!
        - generic:
          - heading "Daun Pemain 2" [level=2]:
            - text: Daun
            - generic: Pemain 2
          - strong:
            - text: —
            - generic: markah
        - status [ref=e76]: Siap! Tunggu teman.
  - dialog [ref=e81]:
    - heading "Pusingan 1 selesai!" [level=2] [ref=e82]
    - paragraph [ref=e83]: Nga · Kita sudah mencuba bersama.
    - generic [ref=e84]:
      - generic [ref=e85]:
        - heading "Bunga" [level=3] [ref=e86]
        - strong [ref=e87]:
          - text: —
          - generic [ref=e88]: markah
        - paragraph [ref=e89]: Siap 35.6 saat
      - generic [ref=e90]:
        - heading "Daun" [level=3] [ref=e91]
        - strong [ref=e92]:
          - text: —
          - generic [ref=e93]: markah
        - paragraph [ref=e94]: Siap 68.5 saat
    - button "Lihat keputusan" [active] [ref=e95] [cursor=pointer]
    - button "Dengar nama Nga" [ref=e96] [cursor=pointer]: Dengar
    - button "Keluar cabaran" [ref=e97] [cursor=pointer]
```