const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generateProductImages() {
    console.log('🚀 Iniciando geração das imagens de produtos...\n');

    // Criar pasta para as imagens
    const outputDir = path.join(__dirname, 'product-images-png');
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
        width: 1200,
        height: 3500,
        deviceScaleFactor: 2 // Retina/alta resolução
    });

    // Carregar a página das imagens
    const htmlPath = `file:///${path.join(__dirname, 'product-images.html').replace(/\\/g, '/')}`;
    await page.goto(htmlPath, { waitUntil: 'networkidle0' });

    // Aguardar fontes carregarem
    await page.evaluate(() => document.fonts.ready);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Lista de imagens para capturar
    const images = [
        { selector: '#main-product', name: 'autovendas-pro-principal' },
        { selector: '#upsell', name: 'guia-anti-bloqueio-upsell' },
        { selector: '#downsell', name: 'pack-templates-downsell' }
    ];

    for (const img of images) {
        try {
            const element = await page.$(img.selector);
            if (element) {
                const outputPath = path.join(outputDir, `${img.name}.png`);

                await element.screenshot({
                    path: outputPath,
                    type: 'png',
                    omitBackground: false
                });

                console.log(`✅ ${img.name}.png (1024x1024px)`);
            }
        } catch (error) {
            console.error(`❌ Erro ao gerar ${img.name}: ${error.message}`);
        }
    }

    await browser.close();

    console.log('\n🎉 Imagens de produtos geradas com sucesso!');
    console.log(`📁 Pasta: ${outputDir}`);
    console.log('\nArquivos criados:');
    const files = fs.readdirSync(outputDir);
    files.forEach(file => {
        const stats = fs.statSync(path.join(outputDir, file));
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`   - ${file} (${sizeKB} KB)`);
    });
}

generateProductImages().catch(console.error);
