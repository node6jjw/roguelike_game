import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor(stage) {
    
    this.stage = stage;
    this.maxHP = 100 + stage*20;
    this.hp = this.maxHP;
    this.attackdamage = 30 + stage * 5;
    this.gold = 0;
  }
  updateStage() {
    this.stage++;
    this.maxHP = 100 + this.stage * 20;
    this.attackdamage = 30 + this.stage * 5;
  }
  
  
  getgold(){
    const gold_multi = Math.random() * (2.0 - 1.0) + 1.0;
    const gold_get = Math.floor(this.stage * 100 * gold_multi);
    this.gold += gold_get;
    return this.gold;
  }

  attack(monster) {
    const damage_multi = Math.random() * (1.5 - 0.7) + 0.7;
    const damage = Math.floor(this.attackdamage * damage_multi);
    monster.hp -= damage;
    return damage;
  }

  heal() {
    const heal_multi = Math.random() * (1.5 - 0.7) + 0.7;
    const heal = Math.floor(this.stage * 50 * heal_multi);
    this.hp += heal;
    if(this.hp>this.maxHP){
      this.hp = this.maxHP;
    }
    return heal;
  }
  dodge(stage) {
    const dodge_base = 0.8;
    let dodge_probable = dodge_base - (stage * 0.01);
    dodge_probable = Math.max(dodge_probable, 0);
    const dodge = Math.random();
    return dodge < dodge_probable;
  }
  
  
}

class Monster {
  constructor(stage) {
    this.hp = 100 + stage * 15;
    this.attackdamage = 1 + stage * 5;
  }

  attack(player) {
    const damage_multi = Math.random() * (1.5 - 0.7) + 0.7;
    const damage = Math.floor(this.attackdamage * damage_multi);
    player.hp -= damage;
    return damage;
  }
}

class Item {
  constructor(name, price, effect) {
    this.name = name;
    this.price = price;
    this.effect = effect;
  }

  use(player) {
    this.effect(player);
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| 플레이어의 체력 ${player.hp} | 플레이어의 공격력 ${player.attackdamage} | 플레이어의 보유 골드 ${player.gold}`
    ) +
    chalk.redBright(
      ` | 몬스터의 체력 ${monster.hp} | 몬스터의 공격력 ${monster.attackdamage}`
    )
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(`\n1. 공격한다 2. 회복한다. 3.도망친다`)
    );

    const choice = readlineSync.question('당신의 선택은? ');

    if (choice === '1') {
      const damageToMonster = player.attack(monster);
      logs.push(chalk.green(`플레이어가 몬스터에게 ${damageToMonster}의 피해를 입혔습니다!`));
      if(damageToMonster > stage * 20)
      {
        const bounse_attack = player.attack(monster);
        logs.push(chalk.green(`플레이어가 강한 피해를 입혀 추가 공격을 시도합니다.`));
        logs.push(chalk.green(`${bounse_attack}만큼의 추가 피해를 입혔습니다..`));
        
      }
    } else if (choice === '2') {
      const healToPlayer = player.heal();
      logs.push(chalk.yellow(`플레이어가 회복 스킬을 사용해 ${healToPlayer}만큼 회복하였습니다!`));
    }
    else if (choice === `3`){
      const runSuccess = player.dodge(stage);
      if (runSuccess) {
        logs.push(chalk.yellow('플레이어가 도망쳤습니다! 골드는 획득할 수 없고 회복되지 않습니다'));
        logs.forEach((log) => console.log(log));
        await new Promise(resolve => setTimeout(resolve, 2000));
        return;
      } else {
        logs.push(chalk.red('도망에 실패했습니다! 몬스터가 공격합니다.'));
      }
    }

    if (monster.hp > 0) {
      const damageToPlayer = monster.attack(player);
      logs.push(chalk.red(`몬스터가 플레이어에게 ${damageToPlayer}의 피해를 입혔습니다!`));
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (monster.hp <= 0) {
    logs.push(chalk.green('몬스터를 물리쳤습니다!'));
    const healToPlayer = player.heal();
    logs.push(chalk.green(`스테이지를 클리어했습니다. ${healToPlayer} 만큼 회복합니다.`));
    await new Promise(resolve => setTimeout(resolve, 1000));
    player.getgold();
    logs.push(chalk.green(`현재 골드 보유량: ${player.gold}`));

  } else if (player.hp <= 0) {
    logs.push(chalk.red('플레이어가 사망했습니다. 프로그램을 종료합니다.'));
    console.clear();
    displayStatus(stage, player, monster);
    logs.forEach((log) => console.log(log));

    await new Promise(resolve => setTimeout(resolve, 3000));
    process.exit(0);
  }

  console.clear();
  displayStatus(stage, player, monster);
  logs.forEach((log) => console.log(log));

  await new Promise(resolve => setTimeout(resolve, 1000));
};

async function store(player) {
  console.log(`상점에 입장하셨습니다.`);
  console.log(`현재 소지 골드: ${player.gold}`);
  
  await displayStoreOptions();
  
  await buyItem(player);

  console.log(`상점을 종료합니다.`);
}

async function buyItem(player) {
  const hpPotion = new Item('최대 체력 100 증가 포션', 100, (player) => { player.hp += 100; });
  const adPotion = new Item('공격력 20 증가 포션', 500, (player) => { player.attackdamage += 20; });
  const item_list = [hpPotion, adPotion];
  
  while (true) {
    console.log(`현재 소지 골드: ${player.gold}`);
    console.log(`아이템 목록:`);
    item_list.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - 가격: ${item.price} 골드`);
    });

    const choice = await getInput('구매할 아이템 번호 입력 (0으로 종료): ');
    
    if (choice === '0') {
      console.log('상점을 종료합니다.');
      break;
    }
    
    const selectedIndex = parseInt(choice) - 1;

    if (selectedIndex < 0 || selectedIndex >= item_list.length) {
      console.log('잘못된 선택입니다. 다시 입력하세요.');
      continue;
    }

    const selectedItem = item_list[selectedIndex];

    if (player.gold >= selectedItem.price) {
      player.gold -= selectedItem.price;
      console.log(`${selectedItem.name}을 구매했습니다.`);
      selectedItem.use(player);
      console.log(`${selectedItem.name}을 사용했습니다.`);
    } else {
      console.log('골드가 부족합니다.');
    }
  }
}

function getInput(query) {
  return new Promise((resolve) => {
    process.stdout.write(query);
    process.stdin.resume();
    process.stdin.once('data', (data) => {
      process.stdin.pause();
      resolve(data.toString().trim());
    });
  });
}

async function displayStoreOptions() {
  let input = await getInput("상점에 입장하려면 3을 입력하세요.");
  while (input !== '3') {
    console.log('잘못된 입력입니다. 3을 입력하세요.');
    input = await getInput("다음 전투로 넘어가려면 3을 입력하세요: ");
  }
}

export async function startGame() {
  console.clear();
  let stage = 1;
  const player = new Player(stage);

  while (stage <= 100) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);

    if (stage % 5 === 0) {
      await store(player);
    }
    player.updateStage();

    stage++;
  }
}
