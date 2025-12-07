const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateBanners() {
    console.log('🚀 Iniciando geração dos banners...\n');

    // Criar pasta para os banners
    const outputDir = path.join(__dirname, 'banners-png');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Configurar viewport grande para garantir qualidade
    await page.setViewport({
        width: 1400,
        height: 1000,
        deviceScaleFactor: 2 // Retina/alta resolução
    });

    // Carregar a página dos banners
    const htmlPath = `file:///${path.join(__dirname, 'checkout-banners.html').replace(/\\/g, '/')}`;
    await page.goto(htmlPath, { waitUntil: 'networkidle0' });

    // Aguardar fontes carregarem
    await page.evaluate(() => document.fonts.ready);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Lista de banners para capturar
    const banners = [
        { selector: '.banner-topo', name: 'banner-topo-completo', width: 1200, height: 150 },
        { selector: '.banner-topo-v2', name: 'banner-topo-minimalista', width: 1200, height: 150 },
        { selector: '.banner-rodape', name: 'banner-rodape-selos', width: 1200, height: 100 },
        { selector: '.banner-rodape-v2', name: 'banner-rodape-garantia', width: 1200, height: 100 }
    ];

    for (const banner of banners) {
        try {
            const element = await page.$(banner.selector);
            if (element) {
                const outputPath = path.join(outputDir, `${banner.name}.png`);

                await element.screenshot({
                    path: outputPath,
                    type: 'png',
                    omitBackground: false
                });

                console.log(`✅ ${banner.name}.png (${banner.width}x${banner.height}px)`);
            }
        } catch (error) {
            console.error(`❌ Erro ao gerar ${banner.name}: ${error.message}`);
        }
    }

    await browser.close();

    console.log('\n🎉 Banners gerados com sucesso!');
    console.log(`📁 Pasta: ${outputDir}`);
    console.log('\nArquivos criados:');
    const files = fs.readdirSync(outputDir);
    files.forEach(file => {
        const stats = fs.statSync(path.join(outputDir, file));
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`   - ${file} (${sizeKB} KB)`);
    });
}

generateBanners().catch(console.error);
