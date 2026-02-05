const mysql = require('mysql2/promise');

async function checkMissingProject() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'rootpassword',
        database: 'bonus_system'
    });

    try {
        console.log('=== 检查所有项目 ===\n');

        const [projects] = await conn.query(`
      SELECT 
        p.id,
        p.name,
        p.manager_id,
        p.cooperation_status,
        p.status,
        e.name as manager_name,
        COUNT(DISTINCT pm.id) as member_count,
        COUNT(DISTINCT CASE WHEN pm.status = 'active' THEN pm.id END) as active_member_count
      FROM projects p
      LEFT JOIN employees e ON p.manager_id = e.id
      LEFT JOIN project_members pm ON pm.project_id = p.id
      GROUP BY p.id, p.name, p.manager_id, p.cooperation_status, p.status, e.name
      ORDER BY p.created_at DESC
    `);

        console.log(`共找到 ${projects.length} 个项目:\n`);

        projects.forEach((proj, index) => {
            console.log(`${index + 1}. ${proj.name} (ID: ${proj.id})`);
            console.log(`   - 项目经理: ${proj.manager_name || '(未设置)'} (ID: ${proj.manager_id || 'null'})`);
            console.log(`   - 项目状态: ${proj.status}`);
            console.log(`   - 协作状态: ${proj.cooperation_status}`);
            console.log(`   - 成员数: ${proj.active_member_count}/${proj.member_count}`);
            console.log('');
        });

        console.log('=== 检查团队申请 ===\n');

        const [apps] = await conn.query(`
      SELECT 
        pta.id,
        pta.project_id,
        pta.applicant_id,
        pta.status,
        p.name as project_name,
        e.name as applicant_name
      FROM project_team_applications pta
      JOIN projects p ON pta.project_id = p.id
      LEFT JOIN employees e ON pta.applicant_id = e.id
      ORDER BY pta.created_at DESC
    `);

        console.log(`共找到 ${apps.length} 个团队申请:\n`);

        apps.forEach((app, index) => {
            console.log(`${index + 1}. 项目: ${app.project_name}`);
            console.log(`   - 申请人: ${app.applicant_name || '(未知)'}`);
            console.log(`   - 状态: ${app.status}`);
            console.log('');
        });

        // 分析哪些项目可能在 /api/projects 中不可见
        console.log('=== 可能在 /api/projects 中不可见的项目 ===\n');

        const problematicProjects = projects.filter(p => {
            // 没有经理的项目
            const noManager = !p.manager_id;
            // 协作状态不是 published 或 approved 的项目
            const badCoopStatus = p.cooperation_status !== 'published' && p.cooperation_status !== 'approved';
            // 没有活跃成员的项目
            const noActiveMembers = p.active_member_count === 0;

            return noManager || badCoopStatus || noActiveMembers;
        });

        if (problematicProjects.length > 0) {
            problematicProjects.forEach(proj => {
                console.log(`❌ ${proj.name} (ID: ${proj.id})`);
                if (!proj.manager_id) console.log('   - 问题: 没有项目经理');
                if (proj.cooperation_status !== 'published' && proj.cooperation_status !== 'approved') {
                    console.log(`   - 问题: 协作状态为 ${proj.cooperation_status}`);
                }
                if (proj.active_member_count === 0) console.log('   - 问题: 没有活跃成员');
                console.log('');
            });
        } else {
            console.log('✅ 所有项目看起来都正常');
        }

    } finally {
        await conn.end();
    }
}

checkMissingProject().catch(console.error);
