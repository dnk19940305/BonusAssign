const mysql = require('mysql2/promise');

async function checkProjects() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'rootpassword',
        database: 'bonus_system'
    });

    try {
        console.log('=== 检查所有项目 ===\n');
        const [projects] = await conn.query(
            'SELECT id, name, manager_id, cooperation_status, status FROM projects ORDER BY created_at DESC LIMIT 10'
        );

        console.log('项目列表:');
        projects.forEach(p => {
            console.log(`- ${p.name} (ID: ${p.id}, 经理ID: ${p.manager_id || '无'}, 协作状态: ${p.cooperation_status})`);
        });

        console.log('\n=== 检查项目成员 ===\n');
        const [members] = await conn.query(`
      SELECT pm.id, pm.project_id, pm.employee_id, pm.status, 
             p.name as project_name, e.name as employee_name
      FROM project_members pm
      JOIN projects p ON pm.project_id = p.id
      LEFT JOIN employees e ON pm.employee_id = e.id
      ORDER BY pm.created_at DESC LIMIT 10
    `);

        members.forEach(m => {
            console.log(`- ${m.employee_name || '未知'} -> ${m.project_name} (状态: ${m.status})`);
        });

        console.log('\n=== 检查团队申请 ===\n');
        const [apps] = await conn.query(`
      SELECT pta.id, pta.project_id, pta.applicant_id, pta.status,
             p.name as project_name, p.manager_id
      FROM project_team_applications pta
      JOIN projects p ON pta.project_id = p.id
      ORDER BY pta.created_at DESC LIMIT 5
    `);

        apps.forEach(a => {
            console.log(`- 项目: ${a.project_name}`);
            console.log(`  申请人ID: ${a.applicant_id}, 项目经理ID: ${a.manager_id || '无'}, 状态: ${a.status}`);
        });

    } finally {
        await conn.end();
    }
}

checkProjects().catch(console.error);
