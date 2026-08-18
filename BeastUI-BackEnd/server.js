const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Permitir que tu app de Angular (localhost:4200) consulte los datos
app.use(express.json());

// --- CONFIGURACIÓN DE CONEXIÓN A HEIDISQL (MYSQL) ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // Reemplaza por tu usuario de HeidiSQL si es diferente
    password: '51919616Nexus',        // Reemplaza por tu contraseña de HeidiSQL
    database: 'beastui'
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado exitosamente a la base de datos beastui_db en HeidiSQL');
});

// --- ENDPOINT 1: TRAER EL MENÚ PRINCIPAL DEL FANFIC ---
app.get('/api/main-menu', (req, res) => {
    const query = 'SELECT name, description FROM main_menu ORDER BY position_order ASC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// --- ENDPOINT 2: TRAER LOS SOCIAL LINKS DEL PROTAGONISTA ---
app.get('/api/social-links', (req, res) => {
    const query = 'SELECT * FROM social_links ORDER BY position_order ASC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error ejecutando Query en HeidiSQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        
        const mappedResults = results.map(item => {
            // VALIDACIÓN: Si el campo de la BD está vacío, es NULL o el texto "null", lo limpiamos a null real
            let driveUrl = item.image_drive_url;
            if (!driveUrl || driveUrl === 'null' || driveUrl.trim() === '') {
                driveUrl = null;
            }

            return {
                num: item.arcana_num,
                name: item.arcana_name,
                sub: item.sub_label,
                rank: item.current_rank,
                desc: item.command_desc,
                avatarUrl: driveUrl // Enviamos un null real y limpio a Angular
            };
        });
        
        res.json(mappedResults);
    });
});

app.get('/api/covers', (req, res) => {
    const query = 'SELECT vol_num as vol, title, synopsis, cover_type as type, image_url as imageUrl FROM fanfic_covers ORDER BY position_order ASC';
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error ejecutando Query en HeidiSQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// --- ENDPOINT 4: CONSULTA EXCLUSIVA PARA EL DIARIO DE SHIDO ---
app.get('/api/diario-shido', (req, res) => {
    const query = `
        SELECT 
            s.arco_num as arcoNum, 
            s.arco_title as arcoTitle, 
            s.entry_title as title, 
            s.content_text as text, 
            s.position_order as \`order\`,
            m.background_image_url as bgImageUrl
        FROM shido_diary s
        CROSS JOIN diary_metadata m
        WHERE m.diary_id = 'SHIDO_MAIN'
        ORDER BY s.position_order ASC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error consultando shido_diary + metadata en HeidiSQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// --- ENDPOINT 5: CONSULTA EXCLUSIVA PARA EL DIARIO DE TOHKA (CON METADATOS) ---
app.get('/api/diario-tohka', (req, res) => {
    const query = `
        SELECT 
            t.arco_num as arcoNum, 
            t.arco_title as arcoTitle, 
            t.entry_title as title, 
            t.content_text as text, 
            t.position_order as \`order\`,
            m.background_image_url as bgImageUrl
        FROM tohka_diary t
        CROSS JOIN diary_metadata m
        WHERE m.diary_id = 'TOHKA_MAIN'
        ORDER BY t.position_order ASC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error consultando la tabla tohka_diary en HeidiSQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// --- ENDPOINT 6: CONSULTA INTEGRAL PARA LA BANDA SONORA (YOUTUBE OST) ---
app.get('/api/fanfic-ost', (req, res) => {
    const query = 'SELECT song_title as title, song_tag as tag, youtube_id as youtubeId, position_order as `order` FROM fanfic_ost ORDER BY position_order ASC';
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error consultando la tabla fanfic_ost en HeidiSQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// --- ENDPOINT 7: CONSULTA ASÍNCRONA PARA ÁNGELES DE LORE ---
app.get('/api/fanfic-angels', (req, res) => {
    const query = 'SELECT arcana_num as arcanaNum, arcana_name as arcanaName, angel_name as name, angel_description as description, angel_image_url as imageUrl, position_order as `order` FROM fanfic_angels ORDER BY position_order ASC';
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error consultando la tabla fanfic_angels en HeidiSQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// --- ENDPOINT 8 BLINDADO: EXPEDIENTE CONFIDENCIAL DEL AUTOR ---
app.get('/api/author-profile', (req, res) => {
    // Escapamos de forma estricta las palabras reservadas `rank` y `database` entre comillas invertidas de SQL
    const query = 'SELECT author_name as `name`, author_rank as `rank`, author_status as `status`, author_bio as `bio`, stat_creativity as `creativity`, stat_writing as `writing`, stat_database as `database`, stat_design as `design`, stat_lore as `lore` FROM author_profile LIMIT 1';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error consultando la tabla author_profile en HeidiSQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        
        // Entregamos a Angular el primer objeto limpio del array
        if (results && results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: "No se encontraron registros en author_profile" });
        }
    });
});

// --- ENDPOINT 9: CONSULTA DINÁMICA DE LA INVITACIÓN DE DISCORD ---
app.get('/api/community-link', (req, res) => {
    const query = "SELECT background_image_url as `url` FROM diary_metadata WHERE diary_id = 'DISCORD_INVITE' LIMIT 1";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error consultando la invitación de Discord en HeidiSQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        
        if (results && results.length > 0) {
            res.json(results[0]); // Escupimos el objeto directo con la propiedad { url: "..." }
        } else {
            res.status(404).json({ error: "No se encontró el metadato DISCORD_INVITE" });
        }
    });
});



// Arrancar el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
});
