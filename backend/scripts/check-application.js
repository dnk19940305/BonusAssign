const mysql = require('mysql2/promise');

async function checkApplication() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'rootpassword',
        database: 'bonus_system'
    });

    try {
        const projectId = 'Zi0bzUtuOE2CAeWk';

        console.log('=== 检查项目 cscsc 的详细信息 ===\n');

        const [project] = await conn.query(
            'SELECT * FROM projects WHERE id = ?',
            [projectId]
        );
        console.log('项目信息:', project[0]);

        console.log('\n=== 团队申请 ===\n');
        const [apps] = await conn.query(
            'SELECT * FROM project_team_applications WHERE project_id = ?',
            [projectId]
        );
        console.log('团队申请:', apps);

        console.log('\n=== 项目成员 ===\n');
        const [members] = await conn.query(`
      SELECT pm.*, e.name as employee_name
      FROM project_members pm
      LEFT JOIN employees e ON pm.employee_id = e.id
      WHERE pm.project_id = ?
      ORDER BY pm.created_at
    `, [projectId]);

        members.forEach(m => {
            console.log(`- ${m.employee_name} (ID: ${m.employee_id})`);
            console.log(`  状态: ${m.status}, application_id: ${m.application_id || '无'}`);
            console.log(`  创建时间: ${m.created_at}`);
        });

    } finally {
        await conn.end();
    }
}

checkApplication().catch(console.error);
