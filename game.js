import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor(stage) {
    this.hp = 100 + stage * 10;

    this.attackdamage = 30 + stage * 5;
  }

  attack(monster) {
    const damage_multi = Math.random() * (1.5 - 0.7) + 0.7;
    const damage = Math.floor(this.attackdamage * damage_multi);
    monster.hp -= damage;
    return damage; // 피해량을 반환

  }
  heal(player){
    const heal_multi = Math.random() * (1.5 - 0.7) + 0.2;
    const  heal = Math.floor(this.hp * heal_multi);
    player.hp += heal;
    return this.hp;
  }
}

class Monster {
  constructor(stage) {
    this.hp = 100 + stage * 15;
    this.attackdamage = 10 + stage * 5;
  }

  attack(player, logs) {
    const damage_multi = Math.random() * (1.5 - 0.7) + 0.7;
    const damage = Math.floor(this.attackdamage * damage_multi);
    player.hp -= damage;
    return damage; // 피해량을 반환
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| 플레이어의 체력 ${player.hp} | 플레이어의 공격력 ${player.attackdamage}`
    ) +
    chalk.redBright(
      ` | 몬스터의 체력 ${monster.hp} | 몬스터의 공격력 ${monster.attackdamage}`
    )
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  // 전투 진행
  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    // 로그 출력
    logs.forEach((log) => console.log(log));

    // 플레이어 행동 선택
    console.log(
      chalk.green(
        `\n1. 공격한다 2. 회복한다.`
      )
    );

    const choice = readlineSync.question('당신의 선택은? ');

    if (choice === '1') {
      // 플레이어가 몬스터에게 공격
      const damageToMonster = player.attack(monster);
      logs.push(chalk.green(`플레이어가 몬스터에게 ${damageToMonster}의 피해를 입혔습니다!`));

    } else if (choice === '2') {
      const HealToPlayer = player.heal(player);
      logs.push(chalk.yellow(`플레이어가 회복 스킬을 사용해 ${HealToPlayer}만큼 회복하였습니다!`));

    }
    if (monster.hp > 0) {
      // 몬스터가 플레이어에게 공격
      const damageToPlayer = monster.attack(player);
      logs.push(chalk.red(`몬스터가 플레이어에게 ${damageToPlayer}의 피해를 입혔습니다!`));
    }
    else{
    }

    // 로그 유지: 로그가 사라지지 않도록 설정
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 전투 결과 출력
  if (monster.hp <= 0) {
    logs.push(chalk.green('몬스터를 물리쳤습니다!'));
  } else if (player.hp <= 0) {
    logs.push(chalk.red('플레이어가 사망했습니다. 프로그램xj을 종료합니다.'));
    console.clear();
    displayStatus(stage, player, monster);
    logs.forEach((log) => console.log(log));

    await new Promise(resolve => setTimeout(resolve, 3000));
    process.exit(0);
  }

  // 마지막 전투 상태와 로그 출력
  console.clear();
  displayStatus(stage, player, monster);
  logs.forEach((log) => console.log(log));

  // 전투 결과 출력 후 1초 대기
  await new Promise(resolve => setTimeout(resolve, 1000));
};



export async function startGame() {
  console.clear();
  let stage = 1;

  while (stage <= 10) {
    const player = new Player(stage);
    const monster = new Monster(stage);
    await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건
    stage++;
  }
}
