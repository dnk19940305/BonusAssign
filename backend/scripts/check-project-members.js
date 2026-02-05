const mysql = require('mysql2/promise');

async function checkProjectMembers() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'rootpassword',
        database: 'bonus_system'
    });

    try {
        const projectId = 'D757p6y0eoQ1OteU'; // cssesaad1123
        const wangEmployeeId = 'JGDxmyz6YvhgVXzm'; // 王项目经理

        console.log('=== 检查项目 cssesaad1123 的成员 ===\n');

        const [members] = await conn.query(`
      SELECT pm.*, e.name as employee_name
      FROM project_members pm
      LEFT JOIN employees e ON pm.employee_id = e.id
      WHERE pm.project_id = ?
      ORDER BY pm.created_at
    `, [projectId]);

        console.log(`共有 ${members.length} 个成员:\n`);

        let wangIsMember = false;
        members.forEach(m => {
            console.log(`- ${m.employee_name} (ID: ${m.employee_id})`);
            console.log(`  状态: ${m.status}`);
            console.log(`  角色ID: ${m.role_id}`);
            console.log('');

            if (m.employee_id === wangEmployeeId) {
                wangIsMember = true;
            }
        });

        if (wangIsMember) {
            console.log('✅ 王项目经理是该项目的成员');
        } else {
            console.log('❌ 王项目经理不是该项目的成员');
            console.log('   这就是为什么他在 /api/projects 中看不到这个项目!');
        }

        console.log('\n=== 检查项目信息 ===\n');
        const [projects] = await conn.query('SELECT * FROM projects WHERE id = ?', [projectId]);
        const project = projects[0];

        console.log(`项目名称: ${project.name}`);
        console.log(`项目经理ID: ${project.manager_id}`);
        console.log(`协作状态: ${project.cooperation_status}`);

        const [managers] = await conn.query('SELECT name FROM employees WHERE id = ?', [project.manager_id]);
        if (managers.length > 0) {
            console.log(`项目经理姓名: ${managers[0].name}`);
        }

    } finally {
        await conn.end();
    }
}

checkProjectMembers().catch(console.error);
