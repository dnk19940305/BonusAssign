const mysql = require('mysql2/promise');

async function checkBatchApproveIssue() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'rootpassword',
        database: 'bonus_system'
    });

    try {
        console.log('=== 检查批量审批后的项目状态 ===\n');

        // 检查最近批准的成员
        const memberIds = ['1713a760d4990d65', '71f133801abdb950', 'a62cabb8b88d3979'];

        for (const memberId of memberIds) {
            const [members] = await conn.query(
                'SELECT * FROM project_members WHERE id = ?',
                [memberId]
            );

            if (members.length > 0) {
                const member = members[0];
                console.log(`成员 ${memberId}:`);
                console.log(`  - 项目ID: ${member.project_id}`);
                console.log(`  - 员工ID: ${member.employee_id}`);
                console.log(`  - 角色ID: ${member.role_id}`);
                console.log(`  - 状态: ${member.status}`);

                // 检查项目信息
                const [projects] = await conn.query(
                    'SELECT id, name, manager_id, cooperation_status FROM projects WHERE id = ?',
                    [member.project_id]
                );

                if (projects.length > 0) {
                    const project = projects[0];
                    console.log(`  - 项目名称: ${project.name}`);
                    console.log(`  - 项目经理ID: ${project.manager_id || '(空)'}`);
                    console.log(`  - 协作状态: ${project.cooperation_status}`);
                }

                // 检查角色信息
                if (member.role_id) {
                    const [roles] = await conn.query(
                        'SELECT * FROM project_roles WHERE id = ?',
                        [member.role_id]
                    );

                    if (roles.length > 0) {
                        console.log(`  - 角色名称: ${roles[0].name}`);
                        console.log(`  - 角色代码: ${roles[0].code}`);
                    }
                }

                console.log('');
            }
        }

        // 检查团队申请状态
        console.log('=== 检查团队申请状态 ===\n');
        const [apps] = await conn.query(`
      SELECT pta.*, p.name as project_name, p.manager_id
      FROM project_team_applications pta
      JOIN projects p ON pta.project_id = p.id
      ORDER BY pta.created_at DESC
      LIMIT 3
    `);

        apps.forEach(app => {
            console.log(`申请ID: ${app.id}`);
            console.log(`  - 项目: ${app.project_name}`);
            console.log(`  - 申请人ID: ${app.applicant_id}`);
            console.log(`  - 项目经理ID: ${app.manager_id || '(空)'}`);
            console.log(`  - 申请状态: ${app.status}`);
            console.log('');
        });

    } finally {
        await conn.end();
    }
}

checkBatchApproveIssue().catch(console.error);
